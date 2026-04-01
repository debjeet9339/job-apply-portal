'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type MessageType = {
  text: string;
  type: 'success' | 'error' | '';
};

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageType>({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        setMessage({ text: 'Login successful! Redirecting...', type: 'success' });

        setTimeout(() => {
          if (data.user.role === 'admin') {
            router.push('/admin_dashboard');
          } else if (data.user.role === 'recruiter') {
            router.push('/recruiter_dashboard');
          } else {
            router.push('/candidate_dashboard');
          }
        }, 1200);
      } else {
        setMessage({
          text: data.detail || 'Invalid email or password.',
          type: 'error',
        });
      }
    } catch {
      setMessage({
        text: 'Network error. Something went wrong.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B1120] dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-700/20" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-700/20" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-300/10 blur-3xl dark:bg-fuchsia-700/10" />
      </div>

      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <section className="hidden lg:block">
            <div className="max-w-xl">
              <Link href="/" className="mb-8 inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-600/20">
                  C
                </div>
                <div>
                  <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                    CareerNest
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Smart hiring platform
                  </p>
                </div>
              </Link>

              <p className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                Welcome back
              </p>

              <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Sign in and continue your CareerNest journey
              </h1>

              <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-400">
                Access your dashboard, explore jobs, manage applicants, and keep
                everything in one clean workspace.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Platform
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    CareerNest
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Access
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    Secure
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Device
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
                    Responsive
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto w-full max-w-md">
            <div className="mb-6 flex justify-center lg:hidden">
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-600/20">
                  C
                </div>
                <div>
                  <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                    CareerNest
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Smart hiring platform
                  </p>
                </div>
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75 sm:p-8">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Sign in
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Enter your email and password to continue.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.6}
                        stroke="currentColor"
                        className="h-5 w-5 text-slate-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5A2.25 2.25 0 0119.5 19.5h-15a2.25 2.25 0 01-2.25-2.25V6.75"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m3 7.5 7.106 4.441a3.75 3.75 0 003.788 0L21 7.5"
                        />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="block min-h-[50px] w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500 dark:placeholder-slate-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.6}
                        stroke="currentColor"
                        className="h-5 w-5 text-slate-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 10.5h10.5A2.25 2.25 0 0119.5 12.75v6A2.25 2.25 0 0117.25 21h-10.5A2.25 2.25 0 014.5 18.75v-6a2.25 2.25 0 012.25-2.25Z"
                        />
                      </svg>
                    </div>

                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="block min-h-[50px] w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-500 dark:placeholder-slate-500"
                      required
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.6}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 3l18 18M10.477 10.482A3 3 0 0013.5 13.5"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.88 9.88A3 3 0 0114.12 14.12"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228 3 3m18 18-3.228-3.228M17.772 17.772A10.45 10.45 0 0112 19.5c-4.756 0-8.773-3.162-10.065-7.498a10.525 10.525 0 012.938-4.43"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.6}
                          stroke="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {message.text && (
                  <div
                    className={`rounded-2xl px-4 py-4 text-sm font-medium ${
                      message.type === 'success'
                        ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : 'border border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-[50px] w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in to CareerNest'
                  )}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-200 pt-6 text-center dark:border-slate-800">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/signup"
                    className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Create one here
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}