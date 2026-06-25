'use client';

import { useActionState } from 'react';
import { createCategory, type CategoryState } from './actions';

const initial: CategoryState = {};

export default function CategoryForm() {
  const [state, action, pending] = useActionState(createCategory, initial);

  return (
    <form action={action} className="flex flex-col gap-2">
      {state.error && (
        <p role="alert" className="text-sm text-red-700">
          {state.error}
        </p>
      )}
      <div className="flex gap-3">
        <label htmlFor="name" className="sr-only">
          Category name
        </label>
        <input
          id="name"
          name="name"
          placeholder="Category name"
          required
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {pending ? 'Adding…' : 'Add category'}
        </button>
      </div>
    </form>
  );
}
