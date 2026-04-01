'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type UserRole = 'candidate' | 'recruiter' | 'admin';

type UserType = {
  name?: string;
  email?: string;
  role?: UserRole | string;
};

type ProfileStats = {
  primaryLabel: string;
  primaryValue: number;
  secondaryLabel: string;
  secondaryValue: number;
};

export default function ProfilePage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [stats, setStats] = useState<ProfileStats>({
    primaryLabel: 'Total',
    primaryValue: 0,
    secondaryLabel: 'Updates',
    secondaryValue: 0,
  });
  const [message, setMessage] = useState<{ text: string; type: '' | 'error' }>({
    text: '',
    type: '',
  });

  const normalizeRole = (role?: string): UserRole | 'unknown' => {
    if (role === 'candidate' || role === 'recruiter' || role === 'admin') {
      return role;
    }
    return 'unknown';
  };

  const role = normalizeRole(user?.role);

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  };

  const dashboardPath = useMemo(() => {
    if (role === 'candidate') return '/candidate_dashboard';
    if (role === 'recruiter') return '/recruiter_dashboard';
    if (role === 'admin') return '/admin_dashboard';
    return '/login';
  }, [role]);

  const roleDescription = useMemo(() => {
    if (role === 'candidate') {
      return 'Browse jobs, apply quickly, and track your opportunities.';
    }
    if (role === 'recruiter') {
      return 'Post jobs, review applicants, and manage hiring workflows.';
    }
    if (role === 'admin') {
      return 'Moderate jobs, review users, and manage platform activity.';
    }
    return 'Your account information.';
  }, [role]);

  const roleTitle = useMemo(() => {
    if (role === 'candidate') return 'Candidate Account';
    if (role === 'recruiter') return 'Recruiter Account';
    if (role === 'admin') return 'Admin Account';
    return 'User Account';
  }, [role]);

  const getInitial = (value?: string) => {
    return value?.trim()?.charAt(0)?.toUpperCase() || 'U';
  };

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser) as UserType;
      setUser(parsedUser);
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoadingStats(true);
      setMessage({ text: '', type: '' });

      try {
        const token = getToken();

        if (role === 'candidate') {
          const res = await fetch('http://127.0.0.1:8000/jobs');
          const data = await res.json();

          const jobs = Array.isArray(data) ? data : Array.isArray(data?.jobs) ? data.jobs : [];
          setStats({
            primaryLabel: 'Available Jobs',
            primaryValue: jobs.length,
            secondaryLabel: 'Account Type',
            secondaryValue: 1,
          });
          return;
        }

        if (role === 'recruiter') {
          const res = await fetch(
            `http://127.0.0.1:8000/applications/${encodeURIComponent(user.email || '')}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          const applications = Array.isArray(data?.applications) ? data.applications : [];

          setStats({
            primaryLabel: 'Applications',
            primaryValue: applications.length,
            secondaryLabel: 'Posted Access',
            secondaryValue: 1,
          });
          return;
        }

        if (role === 'admin') {
          const [usersRes, jobsRes] = await Promise.all([
            fetch('http://127.0.0.1:8000/users', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
            fetch('http://127.0.0.1:8000/admin/jobs', {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

          const usersData = await usersRes.json();
          const jobsData = await jobsRes.json();

          const totalUsers = Array.isArray(usersData?.users) ? usersData.users.length : 0;
          const pendingJobs = Array.isArray(jobsData?.jobs)
            ? jobsData.jobs.filter((job: any) => job?.status === 'pending').length
            : 0;

          setStats({
            primaryLabel: 'Platform Users',
            primaryValue: totalUsers,
            secondaryLabel: 'Pending Jobs',
            secondaryValue: pendingJobs,
          });
          return;
        }

        setStats({
          primaryLabel: 'Profile',
          primaryValue: 1,
          secondaryLabel: 'Access',
          secondaryValue: 1,
        });
      } catch {
        setMessage({
          text: 'Could not load profile stats right now.',
          type: 'error',
        });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user, role]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B1120] dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-700/20" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-700/20" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-300/10 blur-3xl dark:bg-fuchsia-700/10" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Left: Branding & Page Context */}
            <div className="flex items-center gap-6">
              <Link href="/" className="group flex shrink-0 items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-105 dark:shadow-none">
                  C
                </div>
                <div className="hidden flex-col sm:flex">
                  <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    CareerNest
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500">
                    User Profile
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Navigation & Actions */}
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Navigation - Secondary Style */}
              <Link
                href={dashboardPath}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              {/* Separator */}
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

              {/* User Identity - Compact */}
              <div className="flex items-center gap-3 pl-2">
                <div className="hidden flex-col items-end text-right lg:flex">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user?.name}</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">Verified Member</p>
                </div>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  {getInitial(user?.name)}
                </div>
              </div>

              {/* Logout - Minimalist */}
              <button
                onClick={handleLogout}
                className="ml-2 rounded-lg border border-red-100 bg-white px-3 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-50 hover:border-red-200 dark:border-red-500/10 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-500/10"
              >
                Sign Out
              </button>
            </div>

          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="mb-6 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-indigo-600 text-2xl font-bold text-white shadow-lg shadow-indigo-600/20">
                {getInitial(user?.name)}
              </div>

              <div>
                <p className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  CareerNest Profile
                </p>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {user?.name || 'User'}
                </h1>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 sm:text-base">
                  {roleDescription}
                </p>
              </div>
            </div>

            <RoleBadge role={role} />
          </div>
        </section>

        {message.text && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm font-medium text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
            {message.text}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-12">
          <section className="xl:col-span-8">
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
              <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Account Information
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Basic details for your CareerNest account.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <ReadOnlyField label="Full Name" value={user?.name || 'Not available'} />
                <ReadOnlyField label="Email Address" value={user?.email || 'Not available'} />
                <ReadOnlyField label="Role" value={roleTitle} />
                <ReadOnlyField
                  label="Access Level"
                  value={
                    role === 'admin'
                      ? 'Full platform access'
                      : role === 'recruiter'
                        ? 'Recruitment workspace access'
                        : role === 'candidate'
                          ? 'Job application access'
                          : 'Unknown access'
                  }
                />
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Profile editing
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  This page is currently read-only. If you want editable name, password,
                  photo, or company details, the next step is adding backend endpoints
                  like <span className="font-medium">GET /me</span> and{' '}
                  <span className="font-medium">PUT /me</span>.
                </p>
              </div>
            </div>
          </section>

          <section className="xl:col-span-4">
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-8">
              <div className="mb-6 border-b border-slate-200 pb-4 dark:border-slate-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Quick Overview
                </h2>
              </div>

              {loadingStats ? (
                <div className="space-y-4">
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800/60" />
                  <div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800/60" />
                </div>
              ) : (
                <div className="space-y-4">
                  <MiniStatCard
                    label={stats.primaryLabel}
                    value={stats.primaryValue}
                  />
                  <MiniStatCard
                    label={stats.secondaryLabel}
                    value={stats.secondaryValue}
                  />
                </div>
              )}

              <div className="mt-6 rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-500/10">
                <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-300">
                  Role-based shortcuts
                </p>
                <div className="mt-3 space-y-2">
                  <Link
                    href={dashboardPath}
                    className="block rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Open Dashboard
                  </Link>

                  {role === 'candidate' && (
                    <Link
                      href="/candidate_dashboard"
                      className="block rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Browse Jobs
                    </Link>
                  )}

                  {role === 'recruiter' && (
                    <Link
                      href="/recruiter_dashboard"
                      className="block rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Manage Applicants
                    </Link>
                  )}

                  {role === 'admin' && (
                    <Link
                      href="/admin_dashboard"
                      className="block rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      Review Platform Activity
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <div className="min-h-[50px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200">
        {value}
      </div>
    </div>
  );
}

function MiniStatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const className =
    role === 'admin'
      ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
      : role === 'recruiter'
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
        : role === 'candidate'
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
          : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';

  const label =
    role === 'admin'
      ? 'Admin'
      : role === 'recruiter'
        ? 'Recruiter'
        : role === 'candidate'
          ? 'Candidate'
          : 'Unknown';

  return (
    <span className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${className}`}>
      {label}
    </span>
  );
}