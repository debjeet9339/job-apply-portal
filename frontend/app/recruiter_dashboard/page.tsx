'use client';

import { useEffect, useMemo, useState } from 'react';
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
  skills: string;
};

type ApplicationStatus = 'pending' | 'approved' | 'rejected';

type ApplicationType = {
  _id: string;
  job_id: string;
  candidate_name: string;
  candidate_email: string;
  recruiter_email: string;
  resume_file?: string;
  resume_url?: string;
  status?: ApplicationStatus;
};

type JDResponseType = {
  job_summary: string;
  responsibilities: string[];
  requirements: string[];
  preferred_skills: string[];
  benefits: string[];
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
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
        {value}
      </h3>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{helper}</p>
    </div>
  );
}

function getStatusClasses(status: ApplicationStatus) {
  switch (status) {
    case 'approved':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
    case 'rejected':
      return 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-300';
    default:
      return 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
  }
}

export default function RecruiterDashboard() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const [jobData, setJobData] = useState<JobFormType>({
    title: '',
    company: '',
    location: '',
    description: '',
    salary: '',
    job_type: '',
    skills: '',
  });

  const getErrorMessage = (detail: any, fallback: string) => {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((err: any) => err.msg || 'Validation Error').join(', ');
    }
    if (detail && typeof detail === 'object') return detail.msg || fallback;
    return fallback;
  };

  const buildDescriptionFromAI = (data: JDResponseType) => {
    return `${data.job_summary}

Responsibilities:
${data.responsibilities.map((item) => `• ${item}`).join('\n')}

Requirements:
${data.requirements.map((item) => `• ${item}`).join('\n')}

Preferred Skills:
${data.preferred_skills.map((item) => `• ${item}`).join('\n')}

Benefits:
${data.benefits.map((item) => `• ${item}`).join('\n')}`;
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

    if (parsedUser.role === 'admin') {
      router.push('/admin_dashboard');
      return;
    }

    if (parsedUser.role === 'candidate') {
      router.push('/candidate_dashboard');
      return;
    }

    if (parsedUser.role !== 'recruiter') {
      router.push('/login');
      return;
    }

    fetchApplications(parsedUser.email);
  }, [router]);

  const fetchApplications = async (email: string) => {
    setLoadingApplicants(true);
    setMessage({ text: '', type: '' });

    const token = localStorage.getItem('token');

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/applications/${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        const mappedApplications = (data.applications || []).map((item: ApplicationType) => ({
          ...item,
          status: item.status || 'pending',
        }));
        setApplications(mappedApplications);
      } else {
        setMessage({
          text: getErrorMessage(data.detail, 'Failed to load applicants'),
          type: 'error',
        });
      }
    } catch {
      setMessage({
        text: 'Network error. Something went wrong while fetching applicants.',
        type: 'error',
      });
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setJobData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGenerateJD = async () => {
    if (!jobData.title || !jobData.company || !jobData.location) {
      setMessage({
        text: 'Please fill Job Title, Company Name, and Location before generating AI description.',
        type: 'error',
      });
      return;
    }

    setAiLoading(true);
    setMessage({ text: '', type: '' });

    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://127.0.0.1:8000/generate-job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          salary: jobData.salary,
          employment_type: jobData.job_type,
          skills: jobData.skills
            .split(',')
            .map((skill) => skill.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({
          text: getErrorMessage(data.detail, 'Failed to generate job description'),
          type: 'error',
        });
        return;
      }

      const fullDescription = buildDescriptionFromAI(data);

      setJobData((prev) => ({
        ...prev,
        description: fullDescription,
      }));

      setMessage({
        text: 'AI job description generated successfully.',
        type: 'success',
      });
    } catch {
      setMessage({
        text: 'Network error while generating job description.',
        type: 'error',
      });
    } finally {
      setAiLoading(false);
    }
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
          title: jobData.title,
          company: jobData.company,
          location: jobData.location,
          description: jobData.description,
          salary: jobData.salary,
          job_type: jobData.job_type,
          recruiter_email: user.email,
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
          skills: '',
        });
      } else {
        setMessage({
          text: getErrorMessage(data.detail, 'Failed to post job'),
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

  const handleApplicationAction = async (
    applicationId: string,
    status: ApplicationStatus
  ) => {
    const token = localStorage.getItem('token');
    setActionLoadingId(applicationId);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/applications/${applicationId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setApplications((prev) =>
          prev.map((item) =>
            item._id === applicationId ? { ...item, status } : item
          )
        );

        setMessage({
          text: `Application ${status} successfully.`,
          type: 'success',
        });
      } else {
        setMessage({
          text: getErrorMessage(data.detail, `Failed to ${status} application`),
          type: 'error',
        });
      }
    } catch {
      setMessage({
        text: 'Network error while updating application status.',
        type: 'error',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const applicantCount = applications.length;

  const recruiterInitial = useMemo(() => {
    return user?.name?.trim()?.charAt(0)?.toUpperCase() || 'R';
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
                  Recruiter workspace
                </p>
              </div>
            </Link>

            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:hidden">
              {recruiterInitial}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/80">
              <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:flex dark:bg-indigo-500/15 dark:text-indigo-300">
                {recruiterInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user?.name || 'Recruiter'}
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
                CareerNest recruiter dashboard
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">
                Hire faster with a cleaner, smarter workflow
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Create better job posts, generate descriptions with AI, and manage
                applicants from one responsive dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <StatCard
                title="Applicants"
                value={String(applicantCount)}
                helper="Total received"
              />
              <StatCard
                title="AI Support"
                value="Ready"
                helper="Generate JD quickly"
              />
              <StatCard
                title="Portal"
                value="CareerNest"
                helper="Recruiter panel"
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

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <section className="xl:col-span-5">
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-6 xl:sticky xl:top-24">
              <div className="mb-6 flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Post a new job
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Fill the details and publish on CareerNest.
                  </p>
                </div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                  Recruiter
                </span>
              </div>

              <form onSubmit={handlePostJob} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Job title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={jobData.title}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                    className="block min-h-[50px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Company name *
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={jobData.company}
                    onChange={handleChange}
                    placeholder="e.g. CareerNest Pvt. Ltd."
                    className="block min-h-[50px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={jobData.location}
                      onChange={handleChange}
                      placeholder="e.g. Kolkata / Remote"
                      className="block min-h-[50px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Job type
                    </label>
                    <select
                      name="job_type"
                      value={jobData.job_type}
                      onChange={handleChange}
                      className="block min-h-[50px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
                    >
                      <option value="">Select type</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Internship">Internship</option>
                      <option value="Contract">Contract</option>
                      <option value="Remote">Remote</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Salary
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={jobData.salary}
                    onChange={handleChange}
                    placeholder="e.g. ₹4 LPA - ₹6 LPA"
                    className="block min-h-[50px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Skills
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={jobData.skills}
                    onChange={handleChange}
                    placeholder="e.g. React, Next.js, TypeScript"
                    className="block min-h-[50px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
                  />
                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Add multiple skills separated by commas.
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                        AI Job Description Helper
                      </h3>
                      <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-200/80">
                        Fill title, company, and location first.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateJD}
                      disabled={aiLoading}
                      className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {aiLoading ? 'Generating...' : 'Generate with AI'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Job description *
                  </label>
                  <textarea
                    name="description"
                    value={jobData.description}
                    onChange={handleChange}
                    placeholder="Describe responsibilities, requirements, and benefits..."
                    rows={14}
                    className="block min-h-[260px] w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Posting Job...' : 'Publish Job on CareerNest'}
                </button>
              </form>
            </div>
          </section>

          <section className="xl:col-span-7">
            <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-6">
              <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Recent applicants
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {applicantCount} application{applicantCount !== 1 ? 's' : ''} received
                  </p>
                </div>

                <button
                  onClick={() => user && fetchApplications(user.email)}
                  disabled={loadingApplicants}
                  className="inline-flex min-h-[46px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {loadingApplicants ? 'Refreshing...' : 'Refresh applicants'}
                </button>
              </div>

              {loadingApplicants ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-28 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800/60"
                    />
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                    C
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    No applicants yet
                  </h3>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Once candidates apply to your jobs on CareerNest, their details
                    and resumes will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {applications.map((applicant) => {
                    const currentStatus = applicant.status || 'pending';
                    const isUpdating = actionLoadingId === applicant._id;

                    return (
                      <div
                        key={applicant._id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-300 hover:bg-white dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-slate-700 dark:hover:bg-slate-800/70 sm:p-5"
                      >
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                  {applicant.candidate_name}
                                </h3>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                                    currentStatus
                                  )}`}
                                >
                                  {currentStatus}
                                </span>
                              </div>

                              <p className="mt-2 break-all text-sm text-slate-600 dark:text-slate-400">
                                {applicant.candidate_email}
                              </p>
                            </div>

                            <div className="w-full shrink-0 sm:w-auto">
                              {applicant.resume_url ? (
                                <a
                                  href={applicant.resume_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
                                >
                                  View resume
                                </a>
                              ) : (
                                <span className="inline-flex min-h-[46px] w-full items-center justify-center rounded-2xl bg-slate-200 px-4 py-3 text-sm font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300 sm:w-auto">
                                  No resume provided
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              onClick={() =>
                                handleApplicationAction(applicant._id, 'approved')
                              }
                              disabled={isUpdating || currentStatus === 'approved'}
                              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating && currentStatus !== 'approved'
                                ? 'Updating...'
                                : currentStatus === 'approved'
                                ? 'Approved'
                                : 'Approve'}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleApplicationAction(applicant._id, 'rejected')
                              }
                              disabled={isUpdating || currentStatus === 'rejected'}
                              className="inline-flex min-h-[46px] items-center justify-center rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {isUpdating && currentStatus !== 'rejected'
                                ? 'Updating...'
                                : currentStatus === 'rejected'
                                ? 'Rejected'
                                : 'Reject'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}