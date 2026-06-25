'use client';

import { useActionState } from 'react';
import { createTicket, type TicketState } from './actions';

type Category = { id: string; name: string };

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
const initial: TicketState = {};

export default function TicketForm({ categories }: { categories: Category[] }) {
  const [state, action, pending] = useActionState(createTicket, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-sm font-medium text-zinc-700">
          Title <span aria-hidden>*</span>
        </label>
        <input
          id="title"
          name="title"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-zinc-700">
          Description <span aria-hidden>*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="categoryId" className="text-sm font-medium text-zinc-700">
          Category <span aria-hidden>*</span>
        </label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue=""
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="suggestedPriority" className="text-sm font-medium text-zinc-700">
          Suggested priority <span aria-hidden>*</span>
        </label>
        <select
          id="suggestedPriority"
          name="suggestedPriority"
          required
          defaultValue=""
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        >
          <option value="" disabled>
            Select priority
          </option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p.charAt(0) + p.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="attachment" className="text-sm font-medium text-zinc-700">
          Attachment <span className="text-zinc-400">(optional)</span>
        </label>
        <input id="attachment" name="attachment" type="file" className="text-sm text-zinc-700" />
        <p className="text-xs text-zinc-400">
          Images are converted to JPG and compressed. Other files must be under 1 MB.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? 'Submitting…' : 'Submit ticket'}
      </button>
    </form>
  );
}
