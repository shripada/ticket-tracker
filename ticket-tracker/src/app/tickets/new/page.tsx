import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';
import TicketForm from './TicketForm';

export const metadata = { title: 'New Ticket | Ticket Tracker' };

export default async function NewTicketPage() {
  await requireAuth();

  const categories = await prisma.category.findMany({
    where: { active: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">New Ticket</h1>
      <TicketForm categories={categories} />
    </div>
  );
}
