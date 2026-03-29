'use client';

import { useEffect, useState } from 'react';
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
};

export default function CandidateDashboard() {
  const [user, setUser] = useState<UserType | null>(null);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      if (parsedUser.role !== 'candidate') {
        router.push('/recruiter_dashboard');
        return;
      }
    } else {
      router.push('/login');
      return;
    }

    fetchJobs();
  }, [router]);

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/jobs');
      const data = await res.json();

      if (res.ok) {
        setJobs(data.jobs || []);
      } else {
        setMessage({ text: 'Failed to load jobs', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Something went wrong while fetching jobs', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job: JobType) => {
    if (!user) return;

    setApplyingJobId(job._id);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('http://127.0.0.1:8000/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: job._id,
          candidate_name: user.name,
          candidate_email: user.email,
          recruiter_email: job.recruiter_email,
          resume_link: '',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: `Successfully applied for ${job.title} at ${job.company}!`, type: 'success' });
      } else {
        setMessage({ text: data.detail || 'Failed to apply', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Something went wrong while applying', type: 'error' });
    } finally {
      setApplyingJobId(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-900 transition-colors duration-500 dark:bg-[#0B1120] dark:text-slate-50">
      {/* Background Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-125 w-125 rounded-full bg-indigo-400/20 blur-[120px] dark:bg-indigo-900/20" />
        <div className="absolute right-[0%] top-[20%] h-100 w-100 rounded-full bg-cyan-400/20 blur-[120px] dark:bg-cyan-900/20" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/70 px-6 py-4 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/70 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              JobPortal
            </span>
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name}</p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Candidate</p>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-16">

        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Discover and apply to the latest opportunities matching your profile.
          </p>
        </div>

        {/* Global Messages */}
        {message.text && (
          <div className={`mb-8 rounded-xl p-4 text-sm font-medium border ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'}`}>
            {message.text}
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Available Jobs
          </h2>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
            {jobs.length} open roles
          </span>
        </div>

        {/* Job Listings */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800/50"></div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 py-20 dark:border-slate-700 dark:bg-slate-900/50">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-12 w-12 text-slate-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">No jobs found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl transition-all hover:-translate-y-1 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/70"
              >
                <div>
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {job.title}
                      </h3>
                      <p className="font-medium text-slate-600 dark:text-slate-400">
                        {job.company}
                      </p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {job.location}
                    </span>
                    {job.job_type && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {job.job_type}
                      </span>
                    )}
                    {job.salary && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-3.5 w-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {job.salary}
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 mb-4">
                    <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
                      {job.description}
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  <button
                    onClick={() => router.push(`/apply/${job._id}`)}
                    className="flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-offset-slate-900"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}