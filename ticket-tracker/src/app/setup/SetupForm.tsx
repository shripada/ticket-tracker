'use client';

import { useActionState } from 'react';
import { completeSetup, type SetupState } from './actions';

const initialState: SetupState = {};

export default function SetupForm() {
  const [state, action, pending] = useActionState(completeSetup, initialState);

  return (
    <form action={action} className="flex flex-col gap-5">
      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <fieldset className="flex flex-col gap-1">
        <label htmlFor="orgName" className="text-sm font-medium text-zinc-700">
          Organisation name <span aria-hidden>*</span>
        </label>
        <input
          id="orgName"
          name="orgName"
          required
          autoComplete="organization"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <label htmlFor="allowedDomain" className="text-sm font-medium text-zinc-700">
          Permitted email domain <span aria-hidden>*</span>
        </label>
        <input
          id="allowedDomain"
          name="allowedDomain"
          placeholder="example.com"
          required
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
        <p className="text-xs text-zinc-500">
          Users must have an email address under this domain to register.
        </p>
      </fieldset>

      <hr className="border-zinc-200" />

      <fieldset className="flex flex-col gap-1">
        <label htmlFor="adminName" className="text-sm font-medium text-zinc-700">
          Admin name <span aria-hidden>*</span>
        </label>
        <input
          id="adminName"
          name="adminName"
          required
          autoComplete="name"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <label htmlFor="adminEmail" className="text-sm font-medium text-zinc-700">
          Admin email <span aria-hidden>*</span>
        </label>
        <input
          id="adminEmail"
          name="adminEmail"
          type="email"
          required
          autoComplete="email"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
        />
      </fieldset>

      <fieldset className="flex flex-col gap-1">
        <label htmlFor="adminPassword" className="text-sm font-medium text-zinc-700">
          Password <span aria-hidden>*</span>
        </label>
        <input
          id="adminPassword"
          name="adminPassword"
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
        <label htmlFor="adminPasswordConfirm" className="text-sm font-medium text-zinc-700">
          Confirm password <span aria-hidden>*</span>
        </label>
        <input
          id="adminPasswordConfirm"
          name="adminPasswordConfirm"
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
        {pending ? 'Setting up…' : 'Complete setup'}
      </button>
    </form>
  );
}
