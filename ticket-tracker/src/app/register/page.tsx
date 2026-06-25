import Link from 'next/link';
import RegisterForm from './RegisterForm';

export const metadata = { title: 'Register | Ticket Tracker' };

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-2">
          <h1 className="text-2xl font-semibold text-zinc-900">Create an account</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your email must be on the organisation allowlist to register.
          </p>
        </div>
        <RegisterForm />
        <p className="mt-5 text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link href="/login" className="text-zinc-700 underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
