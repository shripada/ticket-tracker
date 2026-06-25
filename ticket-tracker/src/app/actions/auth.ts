'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { prisma } from '@/lib/prisma';
import { createSession, deleteSession } from '@/lib/session';

export type AuthState = { error?: string; success?: string };

function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase();
  const password = (formData.get('password') as string) ?? '';

  if (!email || !password) return { error: 'Email and password are required.' };

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return { error: 'Invalid email or password.' };
  }

  if (!user.active) {
    return { error: 'Your account has been deactivated. Please contact an administrator.' };
  }

  await createSession(user.id, user.role);
  redirect('/');
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const name = ((formData.get('name') as string) ?? '').trim();
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase();
  const password = (formData.get('password') as string) ?? '';
  const passwordConfirm = (formData.get('passwordConfirm') as string) ?? '';

  if (!name) return { error: 'Name is required.' };
  if (!email) return { error: 'Email is required.' };
  if (!isStrongPassword(password)) {
    return {
      error:
        'Password must be at least 8 characters with an uppercase letter, lowercase letter, and digit.',
    };
  }
  if (password !== passwordConfirm) return { error: 'Passwords do not match.' };

  const settings = await prisma.settings.findFirst();
  if (!settings) return { error: 'System is not configured yet.' };

  const domain = email.split('@')[1] ?? '';
  if (!settings.allowedDomains.includes(domain)) {
    return { error: 'Your email domain is not permitted for registration.' };
  }

  const allowlisted = await prisma.allowlist.findUnique({ where: { email } });
  if (!allowlisted) {
    return { error: 'Your email address is not on the registration allowlist.' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: 'An account with this email already exists.' };

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash } });

  redirect('/login');
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/login');
}

export async function forgotPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = ((formData.get('email') as string) ?? '').trim().toLowerCase();
  if (!email) return { error: 'Email is required.' };

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && user.active) {
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, usedAt: null },
    });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    if (process.env.RESEND_API_KEY) {
      const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
      const resetUrl = `${appUrl}/reset-password?token=${token}`;
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails
        .send({
          from: 'Ticket Tracker <noreply@tickettracker.app>',
          to: user.email,
          subject: 'Reset your password',
          html: `<p>Click the link below to reset your password. It expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
        })
        .catch((err) => console.error('[forgotPassword] email delivery failed:', err));
    }
  }

  return { success: 'If that email address exists, a reset link has been sent.' };
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const token = (formData.get('token') as string) ?? '';
  const password = (formData.get('password') as string) ?? '';
  const passwordConfirm = (formData.get('passwordConfirm') as string) ?? '';

  if (!token) return { error: 'Invalid reset link.' };
  if (password !== passwordConfirm) return { error: 'Passwords do not match.' };
  if (!isStrongPassword(password)) {
    return {
      error:
        'Password must be at least 8 characters with an uppercase letter, lowercase letter, and digit.',
    };
  }

  const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken || resetToken.usedAt !== null || resetToken.expiresAt < new Date()) {
    return { error: 'This reset link is invalid or has expired.' };
  }

  const user = await prisma.user.findUnique({ where: { id: resetToken.userId } });
  if (!user || !user.active) {
    return { error: 'This reset link is invalid or has expired.' };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  redirect('/login');
}
