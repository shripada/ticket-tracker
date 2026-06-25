'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type SetupState = { error?: string };

function isValidDomain(domain: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9-]*\.[a-zA-Z]{2,}$/.test(domain);
}

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export async function completeSetup(_prev: SetupState, formData: FormData): Promise<SetupState> {
  const orgName = ((formData.get('orgName') as string) ?? '').trim();
  const allowedDomain = ((formData.get('allowedDomain') as string) ?? '').trim().toLowerCase();
  const adminName = ((formData.get('adminName') as string) ?? '').trim();
  const adminEmail = ((formData.get('adminEmail') as string) ?? '').trim().toLowerCase();
  const adminPassword = (formData.get('adminPassword') as string) ?? '';
  const adminPasswordConfirm = (formData.get('adminPasswordConfirm') as string) ?? '';

  if (!orgName) return { error: 'Org name is required.' };
  if (!allowedDomain || !isValidDomain(allowedDomain))
    return { error: 'Enter a valid domain (e.g. example.com).' };
  if (!adminName) return { error: 'Admin name is required.' };
  if (!adminEmail) return { error: 'Admin email is required.' };
  if (!isStrongPassword(adminPassword)) {
    return {
      error:
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a digit.',
    };
  }
  if (adminPassword !== adminPasswordConfirm) return { error: 'Passwords do not match.' };

  const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
  if (adminCount > 0) return { error: 'Setup has already been completed.' };

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.$transaction([
    prisma.settings.create({
      data: { orgName, allowedDomains: [allowedDomain] },
    }),
    prisma.user.create({
      data: { name: adminName, email: adminEmail, passwordHash, role: Role.ADMIN },
    }),
  ]);

  redirect('/login');
}
