import Link from 'next/link';
import ResetPasswordForm from './ResetPasswordForm';

export const metadata = { title: 'Set New Password | Ticket Tracker' };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await searchParams;
  const resolvedToken = Array.isArray(token) ? token[0] : token;

  if (!resolvedToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-zinc-900">Invalid link</h1>
          <p className="mt-4 text-sm text-zinc-500">
            This password reset link is missing or malformed.
          </p>
          <Link
            href="/forgot-password"
            className="mt-4 inline-block text-sm text-zinc-700 underline"
          >
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Set new password</h1>
        <ResetPasswordForm token={resolvedToken} />
      </div>
    </div>
  );
}
