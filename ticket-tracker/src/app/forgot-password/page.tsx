import Link from 'next/link';
import ForgotPasswordForm from './ForgotPasswordForm';

export const metadata = { title: 'Reset Password | Ticket Tracker' };

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Forgot password</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
        <ForgotPasswordForm />
        <p className="mt-5 text-center text-sm text-zinc-500">
          <Link href="/login" className="text-zinc-700 underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
