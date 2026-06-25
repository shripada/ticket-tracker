import { Page } from '@playwright/test';

/**
 * Stub: will be implemented in issue 3 (auth).
 * Returns a logged-in page context for the given role.
 */
export async function loginAs(page: Page, role: 'admin' | 'agent' | 'user'): Promise<void> {
  const credentials = {
    admin: { email: 'admin@acme.com', password: 'Password1!' },
    agent: { email: 'agent@acme.com', password: 'Password1!' },
    user: { email: 'charlie@acme.com', password: 'Password1!' },
  };
  const { email, password } = credentials[role];
  // Login flow will be wired once the /login route exists (issue 3).
  void email;
  void password;
  void page;
}
