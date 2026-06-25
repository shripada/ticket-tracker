import Link from 'next/link';
import LoginForm from './LoginForm';

export const metadata = { title: 'Sign In | Ticket Tracker' };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Sign in</h1>
        <LoginForm />
        <div className="mt-5 flex flex-col items-center gap-2 text-sm text-zinc-500">
          <Link href="/forgot-password" className="text-zinc-700 underline">
            Forgot your password?
          </Link>
          <span>
            No account?{' '}
            <Link href="/register" className="text-zinc-700 underline">
              Register
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
