'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type UserType = {
  name: string;
  email: string;
  role: string;
};

type JobType = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  job_type?: string;
  recruiter_email: string;
  deadline?: string;
};

type MessageType = {
  text: string;
  type: 'success' | 'error' | '';
};

function StatCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: string;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{helper}</p>
    </div>
  );
}

export default function CandidateDashboard() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [openOnly, setOpenOnly] = useState(false);
  const [message, setMessage] = useState<MessageType>({ text: '', type: '' });

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/jobs');
      const data = await res.json();

      if (Array.isArray(data)) {
        setJobs(data);
      } else if (data && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      setJobs([]);
      setMessage({
        text: 'Unable to load jobs at this time. Please try again later.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser: UserType = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser.role === 'admin') {
      router.push('/admin_dashboard');
      return;
    }

    if (parsedUser.role === 'recruiter') {
      router.push('/recruiter_dashboard');
      return;
    }

    if (parsedUser.role !== 'candidate') {
      router.push('/login');
      return;
    }

    fetchJobs();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) {
      return { text: 'Open', expired: false, urgent: false };
    }

    const deadlineDate = new Date(deadline).getTime();
    const now = new Date().getTime();
    const diff = deadlineDate - now;

    if (diff <= 0) {
      return { text: 'Application Closed', expired: true, urgent: false };
    }

    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (daysLeft === 1) {
      return { text: 'Ends tomorrow', expired: false, urgent: true };
    }

    if (daysLeft <= 3) {
      return { text: `${daysLeft} days left`, expired: false, urgent: true };
    }

    return { text: `${daysLeft} days left`, expired: false, urgent: false };
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      search.trim() === ''
        ? true
        : job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.company.toLowerCase().includes(search.toLowerCase()) ||
          job.location.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      typeFilter === 'all'
        ? true
        : (job.job_type || '').toLowerCase() === typeFilter.toLowerCase();

    const status = getDeadlineStatus(job.deadline);
    const matchesOpenOnly = openOnly ? !status.expired : true;

    return matchesSearch && matchesType && matchesOpenOnly;
  });

  const openJobsCount = useMemo(() => {
    return jobs.filter((job) => !getDeadlineStatus(job.deadline).expired).length;
  }, [jobs]);

  const urgentJobsCount = useMemo(() => {
    return jobs.filter((job) => getDeadlineStatus(job.deadline).urgent).length;
  }, [jobs]);

  const firstName = user?.name?.split(' ')[0] || 'Candidate';
  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'C';

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B1120] dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-700/20" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-700/20" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-300/10 blur-3xl dark:bg-fuchsia-700/10" />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-600/20">
                C
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                  CareerNest
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Candidate workspace
                </p>
              </div>
            </Link>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:hidden">
              {initial}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:flex dark:bg-indigo-500/15 dark:text-indigo-300">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.name || 'Candidate'}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="mb-6 rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                CareerNest candidate dashboard
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                Welcome back, {firstName} 👋
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Explore curated opportunities, search roles faster, and apply to
                the jobs that match your career goals.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <StatCard
                title="All Jobs"
                value={String(jobs.length)}
                helper="Available in CareerNest"
              />
              <StatCard
                title="Open Jobs"
                value={String(openJobsCount)}
                helper="Still accepting applications"
              />
              <StatCard
                title="Urgent"
                value={String(urgentJobsCount)}
                helper="Closing soon"
              />
            </div>
          </div>
        </section>

        {message.text && (
          <div
            className={`mb-6 rounded-2xl border px-4 py-4 text-sm font-medium ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <section className="mb-6 rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Recommended roles
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Search and filter jobs that fit your profile.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
              <div className="relative w-full md:w-[280px]">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-4 w-4 text-slate-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </div>

                <input
                  type="text"
                  placeholder="Search title, company, location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="min-h-[46px] rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="internship">Internship</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote</option>
              </select>

              <button
                type="button"
                onClick={() => setOpenOnly((prev) => !prev)}
                className={`inline-flex min-h-[46px] items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  openOnly
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200'
                }`}
              >
                {openOnly ? 'Showing Open Jobs' : 'Open Jobs Only'}
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {filteredJobs.length} result{filteredJobs.length !== 1 ? 's' : ''}
            </span>
            {search && (
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                Search: {search}
              </span>
            )}
            {typeFilter !== 'all' && (
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                Type: {typeFilter}
              </span>
            )}
          </div>
        </section>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex min-h-[320px] animate-pulse flex-col rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <div className="mb-5 flex gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
                    <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <div className="h-6 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="mt-5 space-y-3">
                  <div className="h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-3 w-3/5 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
                <div className="mt-auto pt-6">
                  <div className="h-11 w-full rounded-2xl bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900/30">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-8 w-8 text-slate-500 dark:text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              No opportunities found
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Try changing your search, selecting a different job type, or turning
              off the open-only filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredJobs.map((job) => {
              const status = getDeadlineStatus(job.deadline);

              return (
                <div
                  key={job._id}
                  className={`group flex h-full flex-col rounded-3xl border bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md dark:bg-slate-900/70 ${
                    status.expired
                      ? 'border-slate-200 opacity-75 dark:border-slate-800'
                      : 'border-slate-200/70 hover:border-indigo-300 dark:border-slate-800 dark:hover:border-indigo-800'
                  }`}
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3
                        className={`line-clamp-2 text-lg font-bold transition-colors ${
                          status.expired
                            ? 'text-slate-700 dark:text-slate-300'
                            : 'text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400'
                        }`}
                      >
                        {job.title}
                      </h3>
                      <p className="mt-1 truncate font-medium text-slate-500 dark:text-slate-400">
                        {job.company}
                      </p>
                    </div>

                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold ${
                        status.expired
                          ? 'bg-slate-100 text-slate-400 dark:bg-slate-800'
                          : 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300'
                      }`}
                    >
                      {job.company.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {job.location}
                    </span>

                    {job.job_type && (
                      <span className="inline-flex items-center rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                        {job.job_type}
                      </span>
                    )}

                    {job.salary && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        {job.salary}
                      </span>
                    )}
                  </div>

                  <p className="mb-5 line-clamp-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {job.description}
                  </p>

                  <div className="mt-auto border-t border-slate-100 pt-4 dark:border-slate-800">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Application status
                      </span>

                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          status.expired
                            ? 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300'
                            : status.urgent
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                        }`}
                      >
                        {status.text}
                      </span>
                    </div>

                    <button
                      disabled={status.expired}
                      onClick={() => router.push(`/apply/${job._id}`)}
                      className={`inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                        status.expired
                          ? 'cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                          : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500'
                      }`}
                    >
                      {status.expired ? 'Application Closed' : 'Apply on CareerNest'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}