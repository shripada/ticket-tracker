import { test, expect } from '@playwright/test';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { loginAs } from './helpers/auth';

test.describe.configure({ mode: 'serial' });

const PASSWORD = 'Password1!';
const DOMAIN = 'acme.com';

test.describe('Ticket Creation', () => {
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
      data: { orgName: 'Acme Corp', allowedDomains: [DOMAIN], maxOpenTicketsPerUser: 2 },
    });

    await prisma.user.create({
      data: { name: 'Alice Admin', email: 'admin@acme.com', passwordHash: hash, role: Role.ADMIN },
    });
    await prisma.user.create({
      data: { name: 'Bob Agent', email: 'agent@acme.com', passwordHash: hash, role: Role.AGENT },
    });
    await prisma.user.create({
      data: {
        name: 'Charlie User',
        email: 'charlie@acme.com',
        passwordHash: hash,
        role: Role.USER,
      },
    });

    await prisma.category.create({ data: { name: 'Bug', active: true } });
    await prisma.category.create({ data: { name: 'Inactive Cat', active: false } });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── Cycle 1: form renders ──────────────────────────────────────────────────

  test('authenticated user sees the ticket creation form', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/tickets/new');
    await expect(page.getByRole('heading', { name: /new ticket/i })).toBeVisible();
    await expect(page.locator('[name="title"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();
    await expect(page.locator('[name="categoryId"]')).toBeVisible();
    await expect(page.locator('[name="suggestedPriority"]')).toBeVisible();
  });

  test('unauthenticated user is redirected to /login', async ({ page }) => {
    await page.goto('/tickets/new');
    await expect(page).toHaveURL('/login');
  });

  // ── Cycle 2: active categories only ───────────────────────────────────────

  test('only active categories appear in the dropdown', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/tickets/new');
    const options = page.locator('select[name="categoryId"] option');
    const texts = await options.allTextContents();
    expect(texts.some((t) => /Bug/i.test(t))).toBe(true);
    expect(texts.some((t) => /Inactive Cat/i.test(t))).toBe(false);
  });

  // ── Cycle 3: valid submission ──────────────────────────────────────────────

  test('valid submission creates ticket and redirects to detail page', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/tickets/new');

    await page.fill('[name="title"]', 'Login button broken');
    await page.fill('textarea[name="description"]', 'Clicking login does nothing.');
    await page.selectOption('[name="categoryId"]', { label: 'Bug' });
    await page.selectOption('[name="suggestedPriority"]', 'LOW');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/tickets\/[a-z0-9]{10,}/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Login button broken' })).toBeVisible();
  });

  // ── Cycle 4: activity log ─────────────────────────────────────────────────

  test('activity log entry is written when a ticket is created', async () => {
    const ticket = await prisma.ticket.findFirstOrThrow({
      where: { title: 'Login button broken' },
    });
    const log = await prisma.activityLog.findFirstOrThrow({ where: { ticketId: ticket.id } });
    expect(log.action).toBe('TICKET_CREATED');
  });

  // ── Cycle 5: rate limit ───────────────────────────────────────────────────

  test('user at the open-ticket limit is blocked from creating another', async ({ page }) => {
    // Seed a second open ticket so the user is now at limit (2)
    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'charlie@acme.com' } });
    const category = await prisma.category.findFirstOrThrow({ where: { active: true } });
    await prisma.ticket.create({
      data: {
        title: 'Second open ticket',
        description: 'Seeded to hit rate limit.',
        suggestedPriority: 'LOW',
        categoryId: category.id,
        createdById: user.id,
      },
    });

    await loginAs(page, 'user');
    await page.goto('/tickets/new');
    await page.fill('[name="title"]', 'Should be blocked');
    await page.fill('textarea[name="description"]', 'This should not go through.');
    await page.selectOption('[name="categoryId"]', { label: 'Bug' });
    await page.selectOption('[name="suggestedPriority"]', 'LOW');
    await page.click('button[type="submit"]');

    await expect(page.locator('p[role="alert"]')).toContainText(/limit/i);
  });

  // ── Cycle 6: agents and admins bypass rate limit ──────────────────────────

  test('agent can create a ticket even when user limit is reached', async ({ page }) => {
    await loginAs(page, 'agent');
    await page.goto('/tickets/new');
    await page.fill('[name="title"]', 'Agent ticket');
    await page.fill('textarea[name="description"]', 'Agents are exempt.');
    await page.selectOption('[name="categoryId"]', { label: 'Bug' });
    await page.selectOption('[name="suggestedPriority"]', 'MEDIUM');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/tickets\/[a-z0-9]{10,}/, { timeout: 15_000 });
  });

  // ── Cycle 7: image attachment ─────────────────────────────────────────────

  test('image attachment is accepted and stored', async ({ page }) => {
    test.skip(
      !process.env.CLOUDINARY_URL,
      'Cloudinary not configured — set CLOUDINARY_URL to run this test',
    );
    await loginAs(page, 'user');

    // Clean up one open ticket so user is under the limit again
    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'charlie@acme.com' } });
    await prisma.ticket.deleteMany({
      where: { createdById: user.id, title: 'Second open ticket' },
    });

    await page.goto('/tickets/new');
    await page.fill('[name="title"]', 'Ticket with image');
    await page.fill('textarea[name="description"]', 'Has an attachment.');
    await page.selectOption('[name="categoryId"]', { label: 'Bug' });
    await page.selectOption('[name="suggestedPriority"]', 'LOW');

    // Upload a minimal valid PNG (1x1 pixel)
    const pngBytes = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64',
    );
    await page.locator('[name="attachment"]').setInputFiles({
      name: 'pixel.png',
      mimeType: 'image/png',
      buffer: pngBytes,
    });

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/tickets\/[a-z0-9]{10,}/, { timeout: 15_000 });

    const ticket = await prisma.ticket.findFirstOrThrow({ where: { title: 'Ticket with image' } });
    const attachment = await prisma.attachment.findFirstOrThrow({ where: { ticketId: ticket.id } });
    expect(attachment.url).toBeTruthy();
  });

  // ── Cycle 8: oversized non-image rejected ─────────────────────────────────

  test('non-image attachment over 1 MB is rejected', async ({ page }) => {
    await loginAs(page, 'user');

    // Clean existing tickets for charlie so rate limit is not hit
    const user = await prisma.user.findUniqueOrThrow({ where: { email: 'charlie@acme.com' } });
    await prisma.activityLog.deleteMany({ where: { ticket: { createdById: user.id } } });
    await prisma.attachment.deleteMany({ where: { ticket: { createdById: user.id } } });
    await prisma.ticket.deleteMany({ where: { createdById: user.id } });

    await page.goto('/tickets/new');
    await page.fill('[name="title"]', 'Ticket with large file');
    await page.fill('textarea[name="description"]', 'Has an oversized attachment.');
    await page.selectOption('[name="categoryId"]', { label: 'Bug' });
    await page.selectOption('[name="suggestedPriority"]', 'LOW');

    const oversized = Buffer.alloc(1.1 * 1024 * 1024, 'x');
    await page.locator('[name="attachment"]').setInputFiles({
      name: 'big.pdf',
      mimeType: 'application/pdf',
      buffer: oversized,
    });

    await page.click('button[type="submit"]');
    await expect(page.locator('p[role="alert"]')).toContainText(/1 MB|too large/i);
  });

  // ── Cycle 9: validation ───────────────────────────────────────────────────

  test('missing title shows a validation error', async ({ page }) => {
    await loginAs(page, 'user');
    await page.goto('/tickets/new');
    await page.fill('textarea[name="description"]', 'No title provided.');
    await page.selectOption('[name="categoryId"]', { label: 'Bug' });
    await page.selectOption('[name="suggestedPriority"]', 'LOW');
    await page.click('button[type="submit"]');
    await expect(page.locator('p[role="alert"]')).toContainText(/title/i);
  });
});
