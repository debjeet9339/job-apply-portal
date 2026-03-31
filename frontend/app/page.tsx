'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const navItems = [
  { label: 'Features', href: '#features' },
  { label: 'Stats', href: '#stats' },
];

const features = [
  {
    title: 'Smart Matching',
    description:
      'Connect the right candidates with the right roles using a faster and more intelligent hiring flow.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    title: 'Cleaner Dashboards',
    description:
      'Candidates, recruiters, and admins get simple dashboards designed to reduce confusion and save time.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v18h18M7.5 14.25h2.25v3H7.5v-3zm3.75-6h2.25v9h-2.25v-9zm3.75 3h2.25v6H15v-6z" />
      </svg>
    ),
  },
  {
    title: 'Faster Applications',
    description:
      'Help candidates apply quickly and help recruiters review applications with less friction.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-6 w-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9" />
      </svg>
    ),
  },
];

const testimonials = [
  {
    name: 'Aarav Sharma',
    role: 'Frontend Developer',
    text: 'CareerNest made job search feel much easier. The layout is simple, fast, and easy to trust.',
  },
  {
    name: 'Priya Das',
    role: 'Recruiter',
    text: 'Posting roles and checking candidates feels much cleaner now. It saves a lot of time.',
  },
  {
    name: 'Rohit Sen',
    role: 'Hiring Manager',
    text: 'The platform feels modern and smooth on both laptop and mobile. That matters a lot.',
  },
];

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <main className="min-h-screen overflow-x-hidden bg-slate-50 font-sans text-slate-900 transition-colors duration-500 selection:bg-indigo-500/20 dark:bg-[#0B1120] dark:text-slate-50">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-700/20" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl dark:bg-cyan-700/20" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-300/10 blur-3xl dark:bg-fuchsia-700/10" />
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/75">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white shadow-lg shadow-indigo-600/20">
              C
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                CareerNest
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Smart hiring platform
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-slate-600 transition-colors hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              onClick={() => setDarkMode((prev) => !prev)}
              className="relative flex h-10 w-16 items-center rounded-full border border-slate-200 bg-slate-100 p-1 transition dark:border-slate-700 dark:bg-slate-800"
              aria-label="Toggle dark mode"
              type="button"
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-300 dark:bg-slate-950 ${
                  darkMode ? 'translate-x-6' : 'translate-x-0'
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

            <Link
              href="/login"
              className="text-sm font-medium text-slate-700 transition-colors hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Sign In
            </Link>

            <Link
              href="/signup"
              className="inline-flex min-h-[42px] items-center justify-center rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 md:hidden"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 md:hidden">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                >
                  {item.label}
                </a>
              ))}

              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-left text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300"
                type="button"
              >
                {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </button>

              <Link
                href="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
              >
                Sign In
              </Link>

              <Link
                href="/signup"
                className="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      <section className="px-4 pb-20 pt-10 sm:px-6 sm:pt-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
                CareerNest hiring experience
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
                Find the right{' '}
                <span className="bg-gradient-to-r from-indigo-500 to-cyan-400 bg-clip-text text-transparent">
                  talent and opportunity
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
                CareerNest helps candidates discover better jobs and helps recruiters
                hire faster with a clean, modern, and responsive platform.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex min-h-[50px] items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/candidate_dashboard"
                  className="inline-flex min-h-[50px] items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-white dark:hover:bg-slate-800"
                >
                  Explore Jobs
                </Link>
              </div>

              <div
                id="stats"
                className="mt-10 grid grid-cols-1 gap-4 border-t border-slate-200 pt-8 dark:border-slate-800 sm:grid-cols-3"
              >
                {[
                  { label: 'Active Jobs', value: '10K+' },
                  { label: 'Companies', value: '500+' },
                  { label: 'Successful Matches', value: '95%' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                    <div className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 sm:p-6">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.7} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-slate-900 dark:text-white">
                        Frontend Developer
                      </h3>
                      <p className="truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                        CareerNest Labs
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    Full-time
                  </span>
                </div>

                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Location</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-slate-200">Kolkata / Remote</p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Salary</p>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-slate-200">₹4 LPA - ₹8 LPA</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="mb-3 text-xs font-medium text-slate-500 dark:text-slate-400">Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Next.js', 'TypeScript', 'Tailwind'].map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button className="inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                  Quick Apply
                </button>
              </div>

              <div className="absolute -left-4 top-8 hidden rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 lg:block">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">New Matches</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">+24 Today</p>
              </div>

              <div className="absolute -right-4 bottom-8 hidden rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-lg backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95 lg:block">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Applications</p>
                <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">1-click flow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white/70 py-20 dark:bg-slate-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Built for modern hiring
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
              Everything needed to connect candidates and recruiters in one clean experience.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/70"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              People like using CareerNest
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
              A simple interface can make a big difference in hiring.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
              >
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                  “{item.text}”
                </p>
                <div className="mt-5">
                  <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl rounded-3xl bg-slate-900 px-6 py-14 text-center shadow-2xl dark:border dark:border-slate-800 dark:bg-slate-900/80 sm:px-10">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to grow with CareerNest?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Join candidates and recruiters on a platform designed to feel fast, clean, and easy to use.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-[50px] w-full items-center justify-center rounded-2xl bg-indigo-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-indigo-400 sm:w-auto"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-[50px] w-full items-center justify-center rounded-2xl bg-white/10 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/20 sm:w-auto"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white pb-8 pt-14 dark:border-slate-800/50 dark:bg-[#0B1120]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 xl:grid-cols-3">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600 text-lg font-bold text-white">
                  C
                </div>
                <div>
                  <p className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                    CareerNest
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Smart hiring platform
                  </p>
                </div>
              </div>

              <p className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
                CareerNest helps candidates and companies connect through a responsive, modern, and user-friendly job platform.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 xl:col-span-2 md:grid-cols-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Candidates</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Browse Jobs</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Build Resume</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Career Tips</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recruiters</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Post Jobs</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Manage Applicants</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Hiring Tools</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Company</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">About</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Contact</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Support</a></li>
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Legal</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Terms</a></li>
                  <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Accessibility</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} CareerNest. All rights reserved.</p>
            <p>Built for modern job search and hiring.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}