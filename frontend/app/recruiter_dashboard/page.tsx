'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type UserType = {
  name: string;
  email: string;
  role: string;
};

type JobFormType = {
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  job_type: string;
};

type ApplicationType = {
  _id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  recruiter_email: string;
  resume_file?: string;
  resume_url?: string;
};

export default function RecruiterDashboard() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);

  const [jobData, setJobData] = useState<JobFormType>({
    title: '',
    company: '',
    location: '',
    description: '',
    salary: '',
    job_type: '',
  });

  // Helper to safely extract error messages from backend responses
  const getErrorMessage = (detail: any, fallback: string) => {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) return detail.map((err: any) => err.msg || 'Validation Error').join(', ');
    if (detail && typeof detail === 'object') return detail.msg || fallback;
    return fallback;
  };

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    if (parsedUser.role !== 'recruiter') {
      router.push('/candidate_dashboard');
      return;
    }

    fetchApplications(parsedUser.email);
  }, [router]);

  const fetchApplications = async (email: string) => {
    setLoadingApplicants(true);
    setMessage({ text: '', type: '' });
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://127.0.0.1:8000/applications/${encodeURIComponent(email)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok) {
        setApplications(data.applications || []);
      } else {
        setMessage({ text: getErrorMessage(data.detail, 'Failed to load applicants'), type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Something went wrong while fetching applicants.', type: 'error' });
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setJobData({
      ...jobData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePostJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user) return;

    setLoading(true);
    setMessage({ text: '', type: '' });
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://127.0.0.1:8000/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...jobData,
          recruiter_email: user?.email,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Job posted successfully!', type: 'success' });
        setJobData({
          title: '',
          company: '',
          location: '',
          description: '',
          salary: '',
          job_type: '',
        });
      } else {
        setMessage({ text: getErrorMessage(data.detail, 'Failed to post job'), type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error. Something went wrong.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

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
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Recruiter</p>
            </div>
            <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-700 sm:block"></div>
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
      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8 sm:py-12">

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Recruiter Dashboard
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Manage your job postings and review candidate applications.
          </p>
        </div>

        {/* Global Message Alert */}
        {message.text && (
          <div className={`mb-8 rounded-xl p-4 text-sm font-medium border ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

          {/* Left Column: Post Job Form */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 rounded-3xl border border-slate-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70 sm:p-8">
              <div className="mb-6 flex items-center gap-3 border-b border-slate-200 pb-4 dark:border-slate-800">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Post a New Job</h2>
              </div>

              <form onSubmit={handlePostJob} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={jobData.title}
                    onChange={handleChange}
                    placeholder="e.g. Senior Frontend Engineer"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Company Name *</label>
                  <input
                    type="text"
                    name="company"
                    value={jobData.company}
                    onChange={handleChange}
                    placeholder="Your Company Ltd."
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Location *</label>
                    <input
                      type="text"
                      name="location"
                      value={jobData.location}
                      onChange={handleChange}
                      placeholder="e.g. Remote, NY"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Job Type</label>
                    <input
                      type="text"
                      name="job_type"
                      value={jobData.job_type}
                      onChange={handleChange}
                      placeholder="e.g. Full-time"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Salary</label>
                  <input
                    type="text"
                    name="salary"
                    value={jobData.salary}
                    onChange={handleChange}
                    placeholder="e.g. $100k - $120k"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Job Description *</label>
                  <textarea
                    name="description"
                    value={jobData.description}
                    onChange={handleChange}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={4}
                    className="block w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800/50 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-2 flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-70 dark:focus:ring-offset-slate-900"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Posting Job...
                    </span>
                  ) : (
                    'Publish Job'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Applicants List */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200/60 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-900/70 sm:p-8">
              <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Applicants</h2>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{applications.length} total applications</p>
                  </div>
                </div>

                <button
                  onClick={() => user && fetchApplications(user.email)}
                  disabled={loadingApplicants}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`h-4 w-4 ${loadingApplicants ? 'animate-spin' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Refresh
                </button>
              </div>

              {loadingApplicants ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800/50"></div>
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center dark:border-slate-700 dark:bg-slate-900/50">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mb-4 h-10 w-10 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No applicants yet</h3>
                  <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                    When candidates apply to your jobs, their applications and resumes will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {applications.map((applicant) => (
                    <div
                      key={applicant._id}
                      className="group flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors hover:border-slate-300 dark:border-slate-700/60 dark:bg-slate-800/30 dark:hover:border-slate-600 sm:flex-row sm:items-center"
                    >
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {applicant.candidate_name}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            <a href={`mailto:${applicant.candidate_email}`} className="hover:text-indigo-600 dark:hover:text-indigo-400">
                              {applicant.candidate_email}
                            </a>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
                            </svg>
                            <span className="font-mono text-xs">ID: {applicant.job_id.slice(-6)}</span>
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {applicant.resume_url ? (
                          <a
                            href={applicant.resume_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-slate-200 transition-all hover:bg-slate-50 dark:bg-slate-900 dark:text-indigo-400 dark:ring-slate-700 dark:hover:bg-slate-800 sm:w-auto"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                            View Resume
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            No Resume Provided
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}