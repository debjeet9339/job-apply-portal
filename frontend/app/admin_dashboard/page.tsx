'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type UserType = {
  name?: string;
  email?: string;
  role?: string;
};

type AppUser = {
  _id: string;
  name: string;
  email: string;
  role: string;
};

type JobStatus = 'pending' | 'approved' | 'rejected';

type JobType = {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  job_type: string;
  recruiter_email: string;
  status: JobStatus;
};

type MessageType = {
  text: string;
  type: '' | 'success' | 'error';
};

type JobFilterType = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminDashboard() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<MessageType>({ text: '', type: '' });
  const [jobFilter, setJobFilter] = useState<JobFilterType>('all');
  const [userSearch, setUserSearch] = useState('');

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  };

  const getInitial = (value?: string) => {
    return value?.trim()?.charAt(0)?.toUpperCase() || '?';
  };

  const formatLabel = (value?: string) => {
    if (!value) return 'Unknown';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const normalizeRole = (role: unknown): string => {
    if (role === 'admin' || role === 'recruiter' || role === 'candidate') {
      return role;
    }
    return 'unknown';
  };

  const normalizeStatus = (status: unknown): JobStatus => {
    if (status === 'approved' || status === 'rejected' || status === 'pending') {
      return status;
    }
    return 'pending';
  };

  const normalizeUser = (user: any, index: number): AppUser => {
    return {
      _id: String(user?._id || `user-${index}`),
      name: String(user?.name || 'Unknown User'),
      email: String(user?.email || 'No email'),
      role: normalizeRole(user?.role),
    };
  };

  const normalizeJob = (job: any, index: number): JobType => {
    return {
      _id: String(job?._id || `job-${index}`),
      title: String(job?.title || 'Untitled Job'),
      company: String(job?.company || 'Unknown Company'),
      location: String(job?.location || 'Unknown Location'),
      description: String(job?.description || 'No description provided.'),
      salary: String(job?.salary || 'Not specified'),
      job_type: String(job?.job_type || 'Not specified'),
      recruiter_email: String(job?.recruiter_email || 'No recruiter email'),
      status: normalizeStatus(job?.status),
    };
  };

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
  };

  const clearMessageLater = () => {
    setTimeout(() => {
      setMessage({ text: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser(parsedUser);

      if (parsedUser.role === 'candidate') {
        router.push('/candidate_dashboard');
        return;
      }

      if (parsedUser.role === 'recruiter') {
        router.push('/recruiter_dashboard');
        return;
      }

      if (parsedUser.role !== 'admin') {
        router.push('/login');
        return;
      }

      fetchUsers();
      fetchJobs();
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [router]);

  const fetchUsers = async () => {
    setLoadingUsers(true);

    try {
      const token = getToken();

      const res = await fetch('http://127.0.0.1:8000/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        const safeUsers = Array.isArray(data.users)
          ? data.users.map((user: any, index: number) => normalizeUser(user, index))
          : [];
        setUsers(safeUsers);
      } else {
        showMessage(data.detail || 'Failed to load users', 'error');
      }
    } catch {
      showMessage('Network error while loading users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);

    try {
      const token = getToken();

      const res = await fetch('http://127.0.0.1:8000/admin/jobs', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        const safeJobs = Array.isArray(data.jobs)
          ? data.jobs.map((job: any, index: number) => normalizeJob(job, index))
          : [];
        setJobs(safeJobs);
      } else {
        showMessage(data.detail || 'Failed to load jobs', 'error');
      }
    } catch {
      showMessage('Network error while loading jobs', 'error');
    } finally {
      setLoadingJobs(false);
    }
  };

  const updateJobStatus = async (jobId: string, status: 'approved' | 'rejected') => {
    setActionLoadingId(jobId);
    setMessage({ text: '', type: '' });

    try {
      const token = getToken();

      const res = await fetch(`http://127.0.0.1:8000/admin/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage(data.message || `Job ${status} successfully`, 'success');
        setJobs((prev) =>
          prev.map((job) => (job._id === jobId ? { ...job, status } : job))
        );
        clearMessageLater();
      } else {
        showMessage(data.detail || 'Failed to update job status', 'error');
      }
    } catch {
      showMessage('Network error while updating job status', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const stats = useMemo(() => {
    return {
      totalUsers: users.length,
      candidates: users.filter((u) => u.role === 'candidate').length,
      recruiters: users.filter((u) => u.role === 'recruiter').length,
      admins: users.filter((u) => u.role === 'admin').length,
      totalJobs: jobs.length,
      pendingJobs: jobs.filter((j) => j.status === 'pending').length,
      approvedJobs: jobs.filter((j) => j.status === 'approved').length,
      rejectedJobs: jobs.filter((j) => j.status === 'rejected').length,
    };
  }, [users, jobs]);

  const filteredJobs = useMemo(() => {
    if (jobFilter === 'all') return jobs;
    return jobs.filter((job) => job.status === jobFilter);
  }, [jobs, jobFilter]);

  const filteredUsers = useMemo(() => {
    const term = userSearch.trim().toLowerCase();
    if (!term) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.role.toLowerCase().includes(term)
    );
  }, [users, userSearch]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 transition-colors duration-500 dark:bg-[#0B1120] dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-700/20" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl dark:bg-fuchsia-700/20" />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">

            {/* Left Side: Brand & Identity */}
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm dark:bg-indigo-600">
                  <span className="text-base font-bold">C</span>
                </div>
                <div className="hidden flex-col sm:flex">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                      CareerNest
                    </span>
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 ring-1 ring-inset ring-indigo-700/10 dark:bg-indigo-500/10 dark:text-indigo-400">
                      Admin
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    Control Center
                  </span>
                </div>
              </Link>

              {/* Optional: Desktop Navigation Links could go here */}
            </div>

            {/* Right Side: User Menu & Actions */}
            <div className="flex items-center gap-3 md:gap-6">

              {/* User Profile Summary */}
              <div className="flex items-center gap-3 border-l border-slate-200 pl-6 dark:border-slate-800">
                <div className="flex flex-col items-end text-right">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    {currentUser?.name || 'Administrator'}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                      System Active
                    </p>
                  </div>
                </div>

                <button className="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {getInitial(currentUser?.name)}
                  </span>
                  {/* Online Indicator Dot */}
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
                </button>
              </div>

              {/* Global Actions */}
              <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="hidden rounded-lg px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 sm:block"
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-lg bg-white px-3.5 py-2 text-xs font-bold text-red-600 ring-1 ring-inset ring-red-200 transition-all hover:bg-red-50 hover:ring-red-300 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20 dark:hover:bg-red-500/20"
                >
                  Sign Out
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mb-8">
          <p className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            CareerNest Admin Dashboard
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Command Center
          </h1>
          <p className="mt-2 text-base text-slate-600 dark:text-slate-400 sm:text-lg">
            Monitor platform activity, review job approvals, and manage users.
          </p>
        </div>

        {message.text && (
          <div
            className={`mb-8 rounded-2xl border px-4 py-4 text-sm font-medium shadow-sm ${message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'
              }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Users" value={stats.totalUsers} helper="All registered accounts" />
          <StatCard label="Candidates" value={stats.candidates} helper="Job seekers" />
          <StatCard label="Recruiters" value={stats.recruiters} helper="Hiring accounts" />
          <StatCard label="Pending Jobs" value={stats.pendingJobs} helper="Waiting for review" />
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <section className="flex flex-col rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 xl:col-span-8 sm:p-6">
            <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Job Moderation Queue
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Review pending, approved, and rejected job posts.
                </p>
              </div>

              <button
                onClick={fetchJobs}
                className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Sync Jobs
              </button>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as JobFilterType[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setJobFilter(filter)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${jobFilter === filter
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                >
                  {formatLabel(filter)}
                </button>
              ))}
            </div>

            <div className="flex-1">
              {loadingJobs ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-44 animate-pulse rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50"
                    />
                  ))}
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/20">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No jobs found for this filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredJobs.map((job) => (
                    <div
                      key={job._id}
                      className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/50"
                    >
                      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              {job.title}
                            </h3>
                            <StatusBadge status={job.status} />
                          </div>

                          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                            {job.company}
                            <span className="mx-2 text-slate-300 dark:text-slate-600">•</span>
                            {job.location}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                              {job.job_type || 'Not specified'}
                            </span>
                            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                              {job.salary || 'Not specified'}
                            </span>
                          </div>

                          <p className="mt-3 break-all text-xs text-slate-500 dark:text-slate-500">
                            Recruiter: {job.recruiter_email}
                          </p>
                        </div>

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {getInitial(job.company)}
                        </div>
                      </div>

                      <div className="mb-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/30">
                        <p className="whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                          {job.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {job.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateJobStatus(job._id, 'approved')}
                              disabled={actionLoadingId === job._id}
                              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {actionLoadingId === job._id ? 'Processing...' : 'Approve Job'}
                            </button>

                            <button
                              onClick={() => updateJobStatus(job._id, 'rejected')}
                              disabled={actionLoadingId === job._id}
                              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {job.status === 'approved' && (
                          <button
                            onClick={() => updateJobStatus(job._id, 'rejected')}
                            disabled={actionLoadingId === job._id}
                            className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {actionLoadingId === job._id ? 'Processing...' : 'Revoke & Reject'}
                          </button>
                        )}

                        {job.status === 'rejected' && (
                          <div className="inline-flex min-h-[44px] items-center rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
                            This job has been rejected.
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="flex flex-col rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 xl:col-span-4 sm:p-6">
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  User Directory
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Quick view of all accounts
                </p>
              </div>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {users.length} total
              </span>
            </div>

            <div className="mb-4">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search name, email, role..."
                className="block min-h-[46px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {loadingUsers ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3 dark:border-slate-800/50"
                    >
                      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                        <div className="h-2 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                  No matching users found.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {getInitial(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>

                      <RoleBadge role={user.role} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/70 sm:p-6">
          <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                User Management
              </h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Detailed user list with roles and account emails.
              </p>
            </div>

            <button
              onClick={fetchUsers}
              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Sync Users
            </button>
          </div>

          <div className="overflow-x-auto">
            {loadingUsers ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800/50" />
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No users available.
              </p>
            ) : (
              <table className="w-full min-w-[700px] text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50/80 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="rounded-tl-xl px-4 py-3 font-semibold">User ID</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="rounded-tr-xl px-4 py-3 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="transition hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-4 font-mono text-xs text-slate-500 dark:text-slate-500">
                        {user._id}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="px-4 py-4">{user.email}</td>
                      <td className="px-4 py-4">
                        <RoleBadge role={user.role} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/60">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{helper}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: JobStatus }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);

  const className =
    status === 'approved'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
      : status === 'rejected'
        ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400';

  const dotClass =
    status === 'approved'
      ? 'bg-emerald-500'
      : status === 'rejected'
        ? 'bg-red-500'
        : 'bg-amber-500';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${role === 'admin'
        ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
        : role === 'recruiter'
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
          : role === 'candidate'
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
        }`}
    >
      {role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Unknown'}
    </span>
  );
}