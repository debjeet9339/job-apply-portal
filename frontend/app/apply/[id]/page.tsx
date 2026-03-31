'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
};

type MessageType = {
  text: string;
  type: 'success' | 'error' | '';
};

export default function ApplyJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [job, setJob] = useState<JobType | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<MessageType>({ text: '', type: '' });

  const getErrorMessage = (detail: unknown, fallback: string) => {
    if (typeof detail === 'string') return detail;

    if (Array.isArray(detail) && detail.length > 0) {
      const firstError = detail[0];
      if (firstError && typeof firstError === 'object' && 'msg' in firstError) {
        return String((firstError as { msg: string }).msg);
      }
      return fallback;
    }

    if (detail && typeof detail === 'object' && 'msg' in detail) {
      return String((detail as { msg: string }).msg);
    }

    return fallback;
  };

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser) as UserType;

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

    setUser(parsedUser);
    fetchJob();
  }, [router]);

  const fetchJob = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/jobs/${jobId}`);
      const data = await res.json();

      if (res.ok) {
        setJob(data.job);
      } else {
        setMessage({
          text: getErrorMessage(data.detail, 'Failed to load job details.'),
          type: 'error',
        });
      }
    } catch {
      setMessage({
        text: 'Something went wrong while loading the job.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || !job) return;

    if (!resumeFile) {
      setMessage({
        text: 'Please upload your resume in PDF format.',
        type: 'error',
      });
      return;
    }

    if (resumeFile.type !== 'application/pdf') {
      setMessage({
        text: 'Only PDF files are allowed.',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      const formData = new FormData();
      formData.append('job_id', job._id);
      formData.append('candidate_name', user.name);
      formData.append('candidate_email', user.email);
      formData.append('recruiter_email', job.recruiter_email);
      formData.append('resume', resumeFile);

      const token = localStorage.getItem('token');

      const res = await fetch('http://127.0.0.1:8000/apply', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          text: 'Application submitted successfully! Redirecting...',
          type: 'success',
        });

        setTimeout(() => {
          router.push('/candidate_dashboard');
        }, 1500);
      } else {
        setMessage({
          text: getErrorMessage(
            data.detail,
            'Failed to submit application. Please try again.'
          ),
          type: 'error',
        });
      }
    } catch {
      setMessage({
        text: 'Something went wrong while applying.',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const initial = useMemo(() => {
    return user?.name?.trim()?.charAt(0)?.toUpperCase() || 'C';
  }, [user]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-[#0B1120] dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-700/20" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-700/20" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-300/10 blur-3xl dark:bg-fuchsia-700/10" />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
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
                  Application workspace
                </p>
              </div>
            </Link>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:hidden">
              {initial}
            </div>
          </div>

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
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex min-h-[44px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.7}
            stroke="currentColor"
            className="h-4 w-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </button>

        {loading ? (
          <div className="grid gap-6 xl:grid-cols-12">
            <div className="xl:col-span-7 h-[340px] animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800/60" />
            <div className="xl:col-span-5 h-[340px] animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800/60" />
          </div>
        ) : !job ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-20 text-center dark:border-slate-700 dark:bg-slate-900/30">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.6}
                stroke="currentColor"
                className="h-8 w-8 text-slate-500 dark:text-slate-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Job Not Found
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {message.text || 'The job you are looking for does not exist.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-12">
            <section className="xl:col-span-7">
              <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-7">
                <div className="mb-6 flex flex-col gap-5 border-b border-slate-200 pb-6 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="mb-2 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                      CareerNest Job Application
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                      {job.title}
                    </h1>
                    <p className="mt-2 text-base font-medium text-slate-600 dark:text-slate-400">
                      {job.company}
                    </p>
                  </div>

                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-bold text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                    {job.company.charAt(0).toUpperCase()}
                  </div>
                </div>

                <div className="mb-6 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {job.location}
                  </span>

                  {job.job_type && (
                    <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300">
                      {job.job_type}
                    </span>
                  )}

                  {job.salary && (
                    <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                      {job.salary}
                    </span>
                  )}
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/40">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    Role Description
                  </h2>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {job.description}
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/40">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    Recruiter Contact
                  </p>
                  <p className="mt-2 break-all text-sm font-medium text-slate-800 dark:text-slate-200">
                    {job.recruiter_email}
                  </p>
                </div>
              </div>
            </section>

            <section className="xl:col-span-5">
              <div className="rounded-3xl border border-indigo-200/70 bg-white/90 p-5 shadow-sm dark:border-indigo-500/20 dark:bg-slate-900/70 sm:p-7 xl:sticky xl:top-24">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Submit Application
                  </h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Review your details and upload your resume in PDF format.
                  </p>
                </div>

                <form onSubmit={handleApply} className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        readOnly
                        className="block min-h-[48px] w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        readOnly
                        className="block min-h-[48px] w-full cursor-not-allowed rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Resume / CV (PDF)
                    </label>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center transition hover:border-indigo-400 hover:bg-white dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-indigo-500 dark:hover:bg-slate-800">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.8}
                          stroke="currentColor"
                          className="h-7 w-7"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v2.625A2.625 2.625 0 0116.875 19.5H7.125A2.625 2.625 0 014.5 16.875V14.25m12-6-4.5-4.5m0 0-4.5 4.5m4.5-4.5v12"
                          />
                        </svg>
                      </div>

                      <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
                        Click to upload your resume
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        PDF only
                      </p>

                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>

                    {resumeFile && (
                      <div className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        Selected: {resumeFile.name}
                      </div>
                    )}
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
                    disabled={submitting}
                    className="inline-flex min-h-[50px] w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {submitting ? 'Submitting Application...' : 'Submit on CareerNest'}
                  </button>
                </form>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}