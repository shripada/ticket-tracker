import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const adminCount = await prisma.user.count({ where: { role: Role.ADMIN } });
  if (adminCount === 0) {
    redirect('/setup');
  }

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50">
      <main className="flex flex-col items-center gap-4 py-32">
        <h1 className="text-3xl font-semibold text-zinc-900">Ticket Tracker</h1>
        <p className="text-zinc-500">Dashboard coming soon.</p>
      </main>
    </div>
  );
}
