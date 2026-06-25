import { test, expect } from '@playwright/test';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { loginAs } from './helpers/auth';

test.describe.configure({ mode: 'serial' });

const PASSWORD = 'Password1!';
const DOMAIN = 'acme.com';

test.describe('Category Management', () => {
  let prisma: PrismaClient;

  test.beforeAll(async () => {
    prisma = new PrismaClient();
    const hash = await bcrypt.hash(PASSWORD, 10);

    await prisma.activityLog.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.allowlist.deleteMany();
    await prisma.settings.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    await prisma.settings.create({
      data: { orgName: 'Acme Corp', allowedDomains: [DOMAIN] },
    });

    await prisma.user.create({
      data: { name: 'Alice Admin', email: 'admin@acme.com', passwordHash: hash, role: Role.ADMIN },
    });

    await prisma.user.create({
      data: { name: 'Bob Agent', email: 'agent@acme.com', passwordHash: hash, role: Role.AGENT },
    });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── Cycle 1: page renders for admin ────────────────────────────────────────

  test('admin can access /admin/categories', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/categories');
    await expect(page.getByRole('heading', { name: /categories/i })).toBeVisible();
  });

  // ── Cycle 2: create a category ─────────────────────────────────────────────

  test('admin creates a category; it appears in the list', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/categories');

    await page.fill('[name="name"]', 'Bug');
    await page.click('button[type="submit"]');

    await expect(page.getByRole('cell', { name: 'Bug' })).toBeVisible();
  });

  test('duplicate category name shows an error', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/categories');

    await page.fill('[name="name"]', 'Bug');
    await page.click('button[type="submit"]');

    await expect(page.locator('p[role="alert"]')).toContainText(/already exists/i);
  });

  // ── Cycle 3: rename a category ─────────────────────────────────────────────

  test('admin renames a category', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/categories');

    // Create a fresh category to rename
    await page.fill('[name="name"]', 'To Rename');
    await page.click('button[type="submit"]');
    await expect(page.getByRole('cell', { name: 'To Rename' })).toBeVisible();

    // Click Edit on the "To Rename" row
    const row = page.getByRole('row', { name: /to rename/i });
    await row.getByRole('button', { name: /edit/i }).click();

    // Inline rename field appears
    const renameInput = row.getByRole('textbox');
    await renameInput.fill('Renamed');
    await row.getByRole('button', { name: /save/i }).click();

    await expect(page.getByRole('cell', { name: 'Renamed' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'To Rename' })).not.toBeVisible();
  });

  // ── Cycle 4: deactivate a category ─────────────────────────────────────────

  test('admin deactivates a category; list shows it as inactive', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/admin/categories');

    await page.fill('[name="name"]', 'To Deactivate');
    await page.click('button[type="submit"]');
    await expect(page.getByRole('cell', { name: 'To Deactivate' })).toBeVisible();

    const row = page.getByRole('row', { name: /to deactivate/i });
    await row.getByRole('button', { name: /deactivate/i }).click();

    await expect(row.getByText(/inactive/i)).toBeVisible();
  });

  test('deactivated category is excluded from active-only query', async () => {
    const active = await prisma.category.findMany({ where: { active: true } });
    const names = active.map((c) => c.name);
    expect(names).not.toContain('To Deactivate');
  });

  test('deactivated category is absent from the ticket-creation dropdown', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.goto('/tickets/new');
    const options = page.locator('select[name="categoryId"] option');
    const texts = await options.allTextContents();
    expect(texts.some((t) => /To Deactivate/i.test(t))).toBe(false);
  });

  test('ticket created before a category was deactivated still shows the category name', async ({
    page,
  }) => {
    const admin = await prisma.user.findUniqueOrThrow({ where: { email: 'admin@acme.com' } });
    const category = await prisma.category.findFirstOrThrow({ where: { name: 'To Deactivate' } });

    const ticket = await prisma.ticket.create({
      data: {
        title: 'Old ticket',
        description: 'Created before deactivation.',
        suggestedPriority: 'LOW',
        categoryId: category.id,
        createdById: admin.id,
      },
    });
    await prisma.activityLog.create({
      data: { action: 'TICKET_CREATED', ticketId: ticket.id, actorId: admin.id },
    });

    await loginAs(page, 'admin');
    await page.goto(`/tickets/${ticket.id}`);
    await expect(page.getByText('To Deactivate')).toBeVisible();
  });

  // ── Cycle 5: non-admin is blocked ──────────────────────────────────────────

  test('agent visiting /admin/categories is redirected', async ({ page }) => {
    await loginAs(page, 'agent');
    await page.goto('/admin/categories');
    await expect(page).not.toHaveURL('/admin/categories');
  });

  test('unauthenticated user visiting /admin/categories is redirected to /login', async ({
    page,
  }) => {
    await page.goto('/admin/categories');
    await expect(page).toHaveURL('/login');
  });
});
