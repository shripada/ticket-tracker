'use server';

import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export type CategoryState = { error?: string };

async function requireAdmin(): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');
  if (session.role !== Role.ADMIN) redirect('/');
}

export async function createCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  await requireAdmin();
  const name = ((formData.get('name') as string) ?? '').trim();
  if (!name) return { error: 'Name is required.' };

  try {
    await prisma.category.create({ data: { name } });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2002')
      return { error: 'A category with that name already exists.' };
    throw e;
  }

  revalidatePath('/admin/categories');
  return {};
}

export async function renameCategory(
  _prev: CategoryState,
  formData: FormData,
): Promise<CategoryState> {
  await requireAdmin();
  const id = (formData.get('id') as string) ?? '';
  const name = ((formData.get('name') as string) ?? '').trim();
  if (!id) return { error: 'Category ID is required.' };
  if (!name) return { error: 'Name is required.' };

  try {
    await prisma.category.update({ where: { id }, data: { name } });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2002')
      return { error: 'A category with that name already exists.' };
    throw e;
  }

  revalidatePath('/admin/categories');
  return {};
}

export async function toggleCategory(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = (formData.get('id') as string) ?? '';
  if (!id) throw new Error('Category ID is required.');
  const active = formData.get('active') === 'true';
  await prisma.category.update({ where: { id }, data: { active } });
  revalidatePath('/admin/categories');
}
