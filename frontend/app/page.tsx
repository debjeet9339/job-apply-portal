'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setDarkMode(shouldUseDark);

    if (shouldUseDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode, mounted]);

  if (!mounted) return null;

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-900 selection:bg-indigo-500/30 transition-colors duration-500 dark:bg-[#0B1120] dark:text-slate-50 dark:selection:bg-indigo-500/30">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-[10%] -top-[10%] h-[500px] w-[500px] rounded-full bg-indigo-400/20 blur-[120px] dark:bg-indigo-900/20" />
        <div className="absolute -right-[5%] top-[20%] h-[400px] w-[400px] rounded-full bg-cyan-400/20 blur-[120px] dark:bg-cyan-900/20" />
        <div className="absolute bottom-[-10%] left-[20%] h-[600px] w-[600px] rounded-full bg-blue-400/20 blur-[120px] dark:bg-blue-900/20" />
      </div>

      <header className="sticky top-0 z-50 px-6 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-slate-200/50 bg-white/70 px-6 py-4 shadow-sm backdrop-blur-md transition-all dark:border-slate-800/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
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
          </div>

          <nav className="hidden items-center gap-8 md:flex">
            {['Features', 'Stats', 'Testimonials'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="relative flex h-9 w-16 items-center rounded-full border border-slate-200 bg-slate-100 p-1 transition-colors dark:border-slate-700 dark:bg-slate-800"
              aria-label="Toggle Dark Mode"
              type="button"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 dark:bg-slate-950 ${
                  darkMode ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {darkMode ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-indigo-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 text-amber-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                  </svg>
                )}
              </div>
            </button>

            <div className="hidden h-5 w-px bg-slate-200 dark:bg-slate-800 sm:block" />

            <Link
              href="/login"
              className="hidden text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white sm:block"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-6 pb-24 pt-20 sm:pt-32 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-8">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50/50 px-3 py-1 text-sm font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                <span className="flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-indigo-400"></span>
                <span className="ml-2">Next-generation hiring platform</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                Find the right{' '}
                <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                  talent & opportunity
                </span>
              </h1>

              <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                A streamlined job portal designed for modern professionals. Connect top-tier candidates with industry-leading companies through a seamless, intuitive workflow.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 text-base font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow-indigo-500/25"
                >
                  Start Hiring Now
                </Link>
                <Link
                  href="/jobs"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-8 text-base font-semibold text-slate-900 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50 dark:text-white dark:hover:bg-slate-800"
                >
                  Browse Jobs
                </Link>
              </div>

              <div id="stats" className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-200 pt-8 dark:border-slate-800">
                {[
                  { label: 'Active Jobs', value: '10K+' },
                  { label: 'Companies', value: '500+' },
                  { label: 'Success Rate', value: '95%' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
              <div className="relative rounded-2xl border border-slate-200/50 bg-white/80 p-8 shadow-xl backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-900/80">
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6 text-slate-700 dark:text-slate-300">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Senior Frontend Engineer</h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">NovaTech Solutions</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                    Full-time
                  </span>
                </div>

                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Location</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-slate-200">San Francisco, CA</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Salary Range</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-slate-200">$120k - $150k</p>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Next.js', 'TypeScript', 'Tailwind'].map((skill) => (
                      <span key={skill} className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                  Quick Apply
                </button>
              </div>

              <div className="absolute -left-12 top-10 hidden animate-bounce rounded-xl border border-slate-200/50 bg-white/90 p-4 shadow-lg backdrop-blur-sm dark:border-slate-800/50 dark:bg-slate-900/90 lg:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">New Matches</p>
                    <p className="font-bold text-slate-900 dark:text-white">+24 Today</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-24 dark:bg-slate-900/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Engineered for Modern Hiring
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
              Everything you need to manage the recruitment lifecycle, packed into one beautifully simple interface.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Smart Matching',
                  description: 'AI-driven algorithms pair the right candidates with your specific job requirements instantly.',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  ),
                },
                {
                  title: 'Streamlined Dashboard',
                  description: 'Manage applications, schedule interviews, and track candidate progress from a centralized hub.',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                  ),
                },
                {
                  title: '1-Click Apply',
                  description: 'Candidates can upload their resumes once and apply to multiple roles with a single click.',
                  icon: (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  ),
                },
              ].map((feature, idx) => (
                <div key={idx} className="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-24 sm:px-8">
        <div className="mx-auto max-w-5xl rounded-3xl bg-slate-900 px-6 py-16 text-center shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900/80 sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to accelerate your career or find top talent?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-300">
            Join thousands of professionals and companies already using our platform to make meaningful connections.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-indigo-500 px-8 text-base font-semibold text-white transition-colors hover:bg-indigo-400 sm:w-auto"
            >
              Create Free Account
            </Link>
            <Link
              href="/demo"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-white/10 px-8 text-base font-semibold text-white transition-colors hover:bg-white/20 sm:w-auto"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </section>
      {/* Footer Section */}
      <footer className="border-t border-slate-200 bg-white pb-8 pt-16 dark:border-slate-800/50 dark:bg-[#0B1120]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            {/* Brand & Mission */}
            <div className="space-y-8 xl:col-span-1">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  JobPortal
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                Empowering the future of work by connecting exceptional talent with world-class companies through a seamless, intelligent platform.
              </p>
              {/* Social Icons */}
              <div className="flex space-x-6">
                <a href="#" className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Link Columns */}
            <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">For Candidates</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {['Browse Jobs', 'Salary Tools', 'Career Advice', 'Resume Builder'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-sm leading-6 text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">For Employers</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {['Post a Job', 'Search Resumes', 'Pricing Plans', 'Enterprise Solutions'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-sm leading-6 text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">Company</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {['About Us', 'Our Team', 'Careers', 'Contact Sales'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-sm leading-6 text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-10 md:mt-0">
                  <h3 className="text-sm font-semibold leading-6 text-slate-900 dark:text-white">Legal</h3>
                  <ul role="list" className="mt-6 space-y-4">
                    {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Accessibility'].map((item) => (
                      <li key={item}>
                        <a href="#" className="text-sm leading-6 text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400">
                          {item}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright Bar */}
          <div className="mt-16 border-t border-slate-200 pt-8 dark:border-slate-800/50 sm:mt-20 lg:mt-24">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} JobPortal, Inc. All rights reserved.
              </p>
              <div className="flex gap-4">
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  English (US)
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}