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

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-900 transition-colors duration-500 dark:bg-[#0B1120] dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-indigo-400/10 blur-[120px] dark:bg-indigo-900/20" />
        <div className="absolute right-[0%] top-[20%] h-[400px] w-[400px] rounded-full bg-fuchsia-400/10 blur-[120px] dark:bg-fuchsia-900/20" />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 px-6 py-4 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-indigo-600 dark:shadow-indigo-600/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              JobPortal <span className="font-medium text-slate-400">Admin</span>
            </span>
          </Link>

          <div className="flex items-center gap-5">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {currentUser?.name || 'Admin'}
              </p>
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                System Administrator
              </p>
            </div>

            <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-700 sm:block"></div>

            <button
              onClick={handleLogout}
              className="group inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 hover:text-red-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-red-900/50 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Command Center
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Monitor platform metrics, manage users, and moderate job postings.
          </p>
        </div>

        {message.text && (
          <div
            className={`mb-8 flex items-center gap-3 rounded-xl border p-4 text-sm font-medium shadow-sm ${
              message.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard label="Candidates" value={stats.candidates} />
          <StatCard label="Recruiters" value={stats.recruiters} />
          <StatCard label="Pending Approvals" value={stats.pendingJobs} />
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Job Moderation Section */}
          <section className="flex flex-col rounded-3xl border border-slate-200/80 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 lg:col-span-8">
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Job Moderation Queue
              </h2>
              <button
                onClick={fetchJobs}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Sync
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              {loadingJobs ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50"
                    />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/20">
                  <p className="text-slate-500 dark:text-slate-400">Queue is empty.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {jobs.map((job) => (
                    <div
                      key={job._id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 transition-shadow hover:shadow-md dark:border-slate-700/80 dark:bg-slate-900/50"
                    >
                      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              {job.title}
                            </h3>
                            <StatusBadge status={job.status} />
                          </div>

                          <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                            {job.company} <span className="mx-1 text-slate-300 dark:text-slate-600">•</span>{' '}
                            {job.location}
                          </p>

                          <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
                            Recruiter: {job.recruiter_email}
                          </p>
                        </div>
                      </div>

                      <div className="mb-5 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/30">
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {job.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                        {job.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateJobStatus(job._id, 'approved')}
                              disabled={actionLoadingId === job._id}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-60"
                            >
                              {actionLoadingId === job._id ? 'Processing...' : 'Approve Job'}
                            </button>

                            <button
                              onClick={() => updateJobStatus(job._id, 'rejected')}
                              disabled={actionLoadingId === job._id}
                              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 dark:border-red-900/50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {job.status === 'approved' && (
                          <button
                            onClick={() => updateJobStatus(job._id, 'rejected')}
                            disabled={actionLoadingId === job._id}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 transition-all hover:bg-red-50 dark:border-red-900/50 dark:bg-transparent dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-60"
                          >
                            {actionLoadingId === job._id ? 'Processing...' : 'Revoke & Reject'}
                          </button>
                        )}

                        {job.status === 'rejected' && (
                          <div className="flex w-full items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:bg-red-500/10 dark:text-red-400">
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

          {/* User Directory Quick View Section */}
          <section className="flex flex-col rounded-3xl border border-slate-200/80 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60 lg:col-span-4">
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Directory</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {users.length} Total
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
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
              ) : users.length === 0 ? (
                <p className="text-center text-sm text-slate-500">No users found.</p>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user._id}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-3 transition-colors hover:border-slate-200 hover:bg-slate-50 dark:border-slate-800/60 dark:bg-slate-900/40 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
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

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                            : user.role === 'recruiter'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                            : user.role === 'candidate'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {formatLabel(user.role)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* --- NEW: DETAILED USER MANAGEMENT SECTION --- */}
        <section className="mt-8 flex flex-col rounded-3xl border border-slate-200/80 bg-white/60 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/60">
          <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">User Management</h2>
            <button
              onClick={fetchUsers}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Sync Users
            </button>
          </div>

          <div className="overflow-x-auto">
            {loadingUsers ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800/50" />
                ))}
              </div>
            ) : users.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">No users available.</p>
            ) : (
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                <thead className="bg-slate-50/80 text-xs uppercase text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
                  <tr>
                    <th className="rounded-tl-xl px-4 py-3 font-semibold">User ID</th>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="rounded-tr-xl px-4 py-3 font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-4 font-mono text-xs text-slate-500 dark:text-slate-500">
                        {user._id}
                      </td>
                      <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">
                        {user.name}
                      </td>
                      <td className="px-4 py-4">
                        {user.email}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                              : user.role === 'recruiter'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                              : user.role === 'candidate'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {formatLabel(user.role)}
                        </span>
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/50 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/50">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
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
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {label}
    </span>
  );
}