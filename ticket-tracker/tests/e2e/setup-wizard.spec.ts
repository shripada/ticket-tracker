import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

// Tests depend on sequential state (wizard creates admin, later tests verify it)
test.describe.configure({ mode: 'serial' });

test.describe('Setup Wizard', () => {
  let prisma: PrismaClient;

  test.beforeAll(async () => {
    prisma = new PrismaClient();
    // Clear all data to simulate a fresh install.
    // Order respects FK constraints (dependents first).
    await prisma.activityLog.deleteMany();
    await prisma.attachment.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.ticket.deleteMany();
    await prisma.allowlist.deleteMany();
    await prisma.settings.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  test('visiting / with no admin redirects to /setup', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/setup');
  });

  test('/setup shows the wizard form', async ({ page }) => {
    await page.goto('/setup');
    await expect(page.getByRole('heading', { name: /first-time setup/i })).toBeVisible();
    await expect(page.getByLabel(/organisation name/i)).toBeVisible();
    await expect(page.getByLabel(/permitted email domain/i)).toBeVisible();
    await expect(page.getByLabel(/admin name/i)).toBeVisible();
    await expect(page.getByLabel(/admin email/i)).toBeVisible();
  });

  test('completing wizard creates admin and redirects to /login', async ({ page }) => {
    await page.goto('/setup');

    await page.fill('[name="orgName"]', 'Test Corp');
    await page.fill('[name="allowedDomain"]', 'testcorp.com');
    await page.fill('[name="adminName"]', 'Admin User');
    await page.fill('[name="adminEmail"]', 'admin@testcorp.com');
    await page.fill('[name="adminPassword"]', 'Password1!');
    await page.fill('[name="adminPasswordConfirm"]', 'Password1!');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/login', { timeout: 15_000 });
  });

  test('admin user created in DB with correct role and active status', async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@testcorp.com' } });
    expect(admin).not.toBeNull();
    expect(admin!.role).toBe('ADMIN');
    expect(admin!.name).toBe('Admin User');
    expect(admin!.active).toBe(true);
  });

  test('settings saved with org name and allowed domain', async () => {
    const settings = await prisma.settings.findFirst();
    expect(settings).not.toBeNull();
    expect(settings!.orgName).toBe('Test Corp');
    expect(settings!.allowedDomains).toContain('testcorp.com');
  });

  test('/setup redirects to /login once an admin exists', async ({ page }) => {
    await page.goto('/setup');
    await expect(page).toHaveURL('/login');
  });
});
