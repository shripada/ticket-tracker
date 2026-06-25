import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/guards';

export default async function TicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAuth();
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      createdBy: { select: { name: true } },
      attachments: true,
      activityLogs: {
        orderBy: { createdAt: 'asc' },
        include: { actor: { select: { name: true } } },
      },
    },
  });

  if (!ticket) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-2 flex items-center gap-2">
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
          {ticket.status}
        </span>
        <span className="text-xs text-zinc-400">{ticket.category.name}</span>
      </div>

      <h1 className="mb-1 text-2xl font-semibold text-zinc-900">{ticket.title}</h1>
      <p className="mb-6 text-sm text-zinc-500">
        Opened by {ticket.createdBy.name} · Priority: {ticket.suggestedPriority}
      </p>

      <p className="whitespace-pre-wrap text-sm text-zinc-700">{ticket.description}</p>

      {ticket.attachments.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-medium text-zinc-700">Attachments</h2>
          <ul className="flex flex-col gap-1">
            {ticket.attachments.map((a) => (
              <li key={a.id}>
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-900 underline"
                >
                  {a.filename}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ticket.activityLogs.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-2 text-sm font-medium text-zinc-700">Activity</h2>
          <ul className="flex flex-col gap-1 text-xs text-zinc-500">
            {ticket.activityLogs.map((log) => (
              <li key={log.id}>
                {log.action === 'TICKET_CREATED' && `Ticket created by ${log.actor.name}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
