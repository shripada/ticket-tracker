'use client';

import { useActionState } from 'react';
import { forgotPassword, type AuthState } from '../actions/auth';

const initialState: AuthState = {};

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPassword, initialState);

  if (state.success) {
    return (
      <p role="status" className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
        {state.success}
      </p>
    );
  }

  return (
    <form action={action} className="mt-6 flex flex-col gap-5">
      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <fieldset className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-zinc-700">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </fieldset>

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  );
}
