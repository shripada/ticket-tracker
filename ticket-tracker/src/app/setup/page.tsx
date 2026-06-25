import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import SetupForm from './SetupForm';

export const metadata = { title: 'First-Time Setup | Ticket Tracker' };

export default async function SetupPage() {
  const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
  if (adminCount > 0) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900">First-time setup</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Configure your organisation before anyone can use Ticket Tracker.
          </p>
        </div>
        <SetupForm />
      </div>
    </div>
  );
}
