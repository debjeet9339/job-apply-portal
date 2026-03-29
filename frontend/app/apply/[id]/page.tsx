'use client';

import { useEffect, useState } from 'react';
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
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser) as UserType;

    if (parsedUser.role !== 'candidate') {
      router.push('/recruiter-dashboard');
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

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#0B1120] dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-125 w-125 rounded-full bg-indigo-400/20 blur-[120px] dark:bg-indigo-900/20" />
        <div className="absolute right-[0%] top-[20%] h-100 w-100 rounded-full bg-cyan-400/20 blur-[120px] dark:bg-cyan-900/20" />
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 px-6 py-4 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70 sm:px-8">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path
                  fillRule="evenodd"
                  d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              JobPortal
            </span>
          </Link>

          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {user?.name}
            </p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Candidate
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10 sm:px-8 sm:py-16">
        <button
          onClick={() => router.back()}
          className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4 transition-transform group-hover:-translate-x-1"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Dashboard
        </button>

        {loading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800/50" />
            <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800/50" />
          </div>
        ) : !job ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-20 dark:border-slate-700 dark:bg-slate-900/50">
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              Job Not Found
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {message.text || 'The job you are looking for does not exist.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200/60 bg-white/70 p-8 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70 sm:p-10">
              <div className="mb-6 border-b border-slate-200 pb-6 dark:border-slate-800">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                  {job.title}
                </h1>
                <p className="mt-3 text-lg font-medium text-slate-600 dark:text-slate-400">
                  {job.company}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {job.location}
                  </span>

                  {job.job_type && (
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {job.job_type}
                    </span>
                  )}

                  {job.salary && (
                    <span className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                      {job.salary}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Role Description
                </h3>
                <div className="mt-4 rounded-2xl bg-slate-50 p-6 dark:bg-slate-800/30">
                  <p className="whitespace-pre-wrap leading-relaxed text-slate-600 dark:text-slate-300">
                    {job.description}
                  </p>
                </div>
                <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                  Recruiter Contact:{' '}
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {job.recruiter_email}
                  </span>
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-indigo-200/60 bg-indigo-50/50 p-8 shadow-sm backdrop-blur-xl dark:border-indigo-500/20 dark:bg-slate-900/80 sm:p-10">
              <h2 className="mb-8 text-2xl font-bold text-slate-900 dark:text-white">
                Submit Application
              </h2>

              <form onSubmit={handleApply} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={user?.name || ''}
                      readOnly
                      className="block w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="block w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Resume / CV (PDF)
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                  />
                  {resumeFile && (
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Selected: {resumeFile.name}
                    </p>
                  )}
                </div>

                {message.text && (
                  <div
                    className={`rounded-xl p-4 text-sm font-medium ${
                      message.type === 'success'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-base font-semibold text-white transition-all hover:bg-indigo-700 disabled:opacity-70"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}