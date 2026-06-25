'use client';

import { useActionState } from 'react';
import { resetPassword, type AuthState } from '../actions/auth';

const initialState: AuthState = {};

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, initialState);

  return (
    <form action={action} className="mt-6 flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />

      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <fieldset className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-zinc-700">
          New password <span aria-hidden>*</span>
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <p className="text-xs text-zinc-500">
          Min. 8 characters with at least one uppercase letter, lowercase letter, and digit.
        </p>
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <label htmlFor="passwordConfirm" className="text-sm font-medium text-zinc-700">
          Confirm new password <span aria-hidden>*</span>
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? 'Updating…' : 'Set new password'}
      </button>
    </form>
  );
}
