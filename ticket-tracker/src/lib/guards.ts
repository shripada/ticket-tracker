'use server';

import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { getSession } from '@/lib/session';

export async function requireAdmin(): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== Role.ADMIN) redirect('/');
}
