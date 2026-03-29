'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RequestDemoPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    companyName: '',
    companySize: '',
    role: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);

    setFormData({
      fullName: '',
      workEmail: '',
      companyName: '',
      companySize: '',
      role: '',
      message: '',
    });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-500 dark:bg-[#0B1120] dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-125 w-125 rounded-full bg-indigo-400/20 blur-[120px] dark:bg-indigo-900/20" />
        <div className="absolute -right-[5%] top-[20%] h-100 w-100 rounded-full bg-cyan-400/20 blur-[120px] dark:bg-cyan-900/20" />
        <div className="absolute bottom-[-10%] left-[20%] h-150 w-150 rounded-full bg-blue-400/20 blur-[120px] dark:bg-blue-900/20" />
      </div>

      <section className="px-6 py-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur transition hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              ← Back to Home
            </Link>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            <div className="flex flex-col justify-center">
              <span className="mb-4 inline-flex w-fit rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                Book a personalized walkthrough
              </span>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Request a live demo of our hiring platform
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-400">
                See how recruiters can post jobs, manage applicants, review resume
                PDFs, and streamline the hiring process with a modern dashboard.
              </p>

              <div className="mt-10 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
                  <h3 className="text-lg font-semibold">What you’ll see</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Job posting, candidate applications, recruiter tools, and a full
                    end-to-end workflow.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
                  <h3 className="text-lg font-semibold">Best for</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Startups, agencies, HR teams, and growing companies looking to
                    hire faster.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/60">
                  <h3 className="text-lg font-semibold">Demo duration</h3>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Usually 20–30 minutes with time for Q&amp;A.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/75">
              <div className="mb-8">
                <h2 className="text-2xl font-bold">Request Demo</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Fill in your details and we’ll get back to you soon.
                </p>
              </div>

              {submitted && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                  Demo request submitted successfully.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Work Email</label>
                  <input
                    type="email"
                    name="workEmail"
                    value={formData.workEmail}
                    onChange={handleChange}
                    placeholder="Enter your work email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Company Size</label>
                    <select
                      name="companySize"
                      value={formData.companySize}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="">Select size</option>
                      <option value="1-10">1-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201-500">201-500</option>
                      <option value="500+">500+</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Your Role</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      placeholder="HR Manager / Founder / Recruiter"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us what you want to see in the demo"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
                >
                  Submit Demo Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}