import { Page } from '@playwright/test';

export async function loginAs(page: Page, role: 'admin' | 'agent' | 'user'): Promise<void> {
  const credentials = {
    admin: { email: 'admin@acme.com', password: 'Password1!' },
    agent: { email: 'agent@acme.com', password: 'Password1!' },
    user: { email: 'charlie@acme.com', password: 'Password1!' },
  };
  const { email, password } = credentials[role];

  await page.goto('/login');
  await page.fill('[name="email"]', email);
  await page.fill('[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL('/', { timeout: 15_000 });
}
