'use server';

import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { getSession } from '@/lib/session';
import type { SessionPayload } from '@/lib/session';

export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function requireAdmin(): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== Role.ADMIN) redirect('/');
}
