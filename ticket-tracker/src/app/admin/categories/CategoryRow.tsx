'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { renameCategory, toggleCategory, type CategoryState } from './actions';

type Category = { id: string; name: string; active: boolean };

const initial: CategoryState = {};

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [renameState, renameAction, renamePending] = useActionState(renameCategory, initial);

  if (editing) {
    return (
      <tr className="border-b border-zinc-100">
        <td className="py-2 pr-4 text-zinc-900">{category.name}</td>
        <td className="py-2" colSpan={2}>
          <form action={renameAction} className="flex items-center gap-2">
            <input type="hidden" name="id" value={category.id} />
            <input
              name="name"
              defaultValue={category.name}
              required
              className="rounded-md border border-zinc-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
            />
            {renameState.error && (
              <p role="alert" className="text-sm text-red-700">
                {renameState.error}
              </p>
            )}
            <button
              type="submit"
              disabled={renamePending}
              className="rounded-md bg-zinc-900 px-3 py-1 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-md border border-zinc-300 px-3 py-1 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Cancel
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-zinc-100">
      <td className="py-2 pr-4 text-zinc-900">{category.name}</td>
      <td className="py-2 pr-4">
        {category.active ? (
          <span className="text-xs font-medium text-green-700">Active</span>
        ) : (
          <span className="text-xs font-medium text-zinc-400">Inactive</span>
        )}
      </td>
      <td className="py-2">
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
          >
            Edit
          </button>
          <form action={toggleCategory}>
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="active" value={String(!category.active)} />
            <button
              type="submit"
              className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-100"
            >
              {category.active ? 'Deactivate' : 'Activate'}
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
