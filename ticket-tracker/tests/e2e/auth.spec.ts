import { test, expect } from '@playwright/test';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

test.describe.configure({ mode: 'serial' });

const PASSWORD = 'TestPass1!';
const DOMAIN = 'authtest.com';
const ADMIN_EMAIL = `admin@${DOMAIN}`;
const ACTIVE_EMAIL = `active@${DOMAIN}`;
const INACTIVE_EMAIL = `inactive@${DOMAIN}`;
const ALLOWLISTED_EMAIL = `newuser@${DOMAIN}`;
const WRONG_DOMAIN_EMAIL = 'user@notpermitted.com';
const NOT_ALLOWLISTED_EMAIL = `notlisted@${DOMAIN}`;

test.describe('Authentication', () => {
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
      data: { orgName: 'Auth Test Corp', allowedDomains: [DOMAIN] },
    });

    await prisma.user.create({
      data: { name: 'Admin', email: ADMIN_EMAIL, passwordHash: hash, role: Role.ADMIN },
    });

    await prisma.user.create({
      data: {
        name: 'Active User',
        email: ACTIVE_EMAIL,
        passwordHash: hash,
        role: Role.USER,
        active: true,
      },
    });

    await prisma.user.create({
      data: {
        name: 'Inactive User',
        email: INACTIVE_EMAIL,
        passwordHash: hash,
        role: Role.USER,
        active: false,
      },
    });

    await prisma.allowlist.create({ data: { name: 'New User', email: ALLOWLISTED_EMAIL } });
  });

  test.afterAll(async () => {
    await prisma.$disconnect();
  });

  // ── Login ──────────────────────────────────────────────────────────────────

  test('admin can log in and be redirected to /', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', ADMIN_EMAIL);
    await page.fill('[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 15_000 });
    // Verify the session cookie was actually written
    const cookies = await page.context().cookies();
    expect(cookies.some((c) => c.name === 'session' && c.httpOnly)).toBe(true);
  });

  test('logged-in user can sign out', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', ADMIN_EMAIL);
    await page.fill('[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 15_000 });

    await page.getByRole('button', { name: /sign out/i }).click();
    await expect(page).toHaveURL('/login', { timeout: 15_000 });
    // Verify the session cookie was cleared
    const cookies = await page.context().cookies();
    expect(cookies.some((c) => c.name === 'session')).toBe(false);
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', ACTIVE_EMAIL);
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('p[role="alert"]')).toContainText(/invalid/i);
  });

  test('deactivated account cannot log in', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', INACTIVE_EMAIL);
    await page.fill('[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page.locator('p[role="alert"]')).toContainText(/deactivated/i);
  });

  // ── Registration ───────────────────────────────────────────────────────────

  test('registration blocked by domain mismatch', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="name"]', 'Bad Domain');
    await page.fill('[name="email"]', WRONG_DOMAIN_EMAIL);
    await page.fill('[name="password"]', PASSWORD);
    await page.fill('[name="passwordConfirm"]', PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page.locator('p[role="alert"]')).toContainText(/domain/i);
  });

  test('registration blocked by allowlist miss', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="name"]', 'Not Listed');
    await page.fill('[name="email"]', NOT_ALLOWLISTED_EMAIL);
    await page.fill('[name="password"]', PASSWORD);
    await page.fill('[name="passwordConfirm"]', PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page.locator('p[role="alert"]')).toContainText(/allowlist/i);
  });

  test('happy-path registration redirects to /login', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name="name"]', 'New User');
    await page.fill('[name="email"]', ALLOWLISTED_EMAIL);
    await page.fill('[name="password"]', PASSWORD);
    await page.fill('[name="passwordConfirm"]', PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/login', { timeout: 15_000 });
  });

  test('newly registered user can log in', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', ALLOWLISTED_EMAIL);
    await page.fill('[name="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 15_000 });
  });

  // ── Password reset ─────────────────────────────────────────────────────────

  test('password reset flow completes successfully', async ({ page }) => {
    const NEW_PASSWORD = 'NewPass2!';

    await page.goto('/forgot-password');
    await page.fill('[name="email"]', ACTIVE_EMAIL);
    await page.click('button[type="submit"]');
    await expect(page.locator('p[role="status"]')).toContainText(/reset link/i, {
      timeout: 15_000,
    });

    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { user: { email: ACTIVE_EMAIL } },
      orderBy: { createdAt: 'desc' },
    });
    expect(resetToken).not.toBeNull();

    await page.goto(`/reset-password?token=${resetToken!.token}`);
    await page.fill('[name="password"]', NEW_PASSWORD);
    await page.fill('[name="passwordConfirm"]', NEW_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/login', { timeout: 15_000 });

    // Old link is rejected
    await page.goto(`/reset-password?token=${resetToken!.token}`);
    await page.fill('[name="password"]', 'AnotherPass3!');
    await page.fill('[name="passwordConfirm"]', 'AnotherPass3!');
    await page.click('button[type="submit"]');
    await expect(page.locator('p[role="alert"]')).toContainText(/invalid|expired/i);

    // Log in with new password
    await page.goto('/login');
    await page.fill('[name="email"]', ACTIVE_EMAIL);
    await page.fill('[name="password"]', NEW_PASSWORD);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/', { timeout: 15_000 });

    // Restore original password so other tests are unaffected
    const originalHash = await bcrypt.hash(PASSWORD, 10);
    await prisma.user.update({
      where: { email: ACTIVE_EMAIL },
      data: { passwordHash: originalHash },
    });
  });
});
