'use client';

import { MessageCircle } from 'lucide-react';
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

      <header className="sticky top-0 z-50 w-full border-b border-slate-200/50 bg-white/80 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4 md:h-20">

            {/* Left: Branding */}
            <Link href="/" className="group flex shrink-0 items-center gap-3 transition-opacity hover:opacity-90">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-md shadow-indigo-200 transition-transform group-hover:scale-105 dark:shadow-none">
                C
              </div>
              <div className="hidden flex-col sm:flex">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  CareerNest
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Smart Hiring
                </span>
              </div>
            </Link>

            {/* Center: Main Navigation */}
            <nav className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-indigo-400"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Right: Actions & Theme */}
            <div className="flex items-center gap-2 sm:gap-4">

              {/* Compact Theme Toggle */}
              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <svg className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>

              <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 md:block" />

              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile Toggle */}
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 md:hidden"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                </svg>
              </button>
            </div>

          </div>
        </div>

        {/* Refined Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="absolute left-0 right-0 top-full border-b border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-950 md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a key={item.label} href={item.href} className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900">
                  {item.label}
                </a>
              ))}
              <div className="my-2 h-px bg-slate-100 dark:bg-slate-800" />
              <Link href="/login" className="px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400">Sign In</Link>
              <Link href="/signup" className="mt-2 rounded-xl bg-indigo-600 px-4 py-4 text-center text-sm font-bold text-white shadow-lg">Get Started</Link>
            </nav>
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
      <Link
          href="/career_assistant"
          className="
    fixed bottom-6 right-6 z-50 
    flex items-center gap-3 
    rounded-full px-6 py-3.5
    bg-gradient-to-r from-emerald-600 to-teal-600 
    text-white shadow-2xl shadow-emerald-500/20
    transition-all duration-300 ease-out
    hover:scale-105 hover:shadow-emerald-500/40 
    hover:-translate-y-1 active:scale-95
    cursor-pointer group
    animate-ai-glow
    ring-1 ring-white/20 ring-inset
    dark:from-emerald-500 dark:to-teal-500
  "
        >
          {/* Icon with a subtle "ping" notification dot */}
          <div className="relative">
            <MessageCircle className="h-5 w-5 transition-transform group-hover:rotate-12" />
            <span className="absolute -right-0.5 -top-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-200"></span>
            </span>
          </div>

          {/* Text with improved typography */}
          <div className="flex flex-col items-start leading-none">
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest opacity-80">
              Assistant
            </span>
            <span className="hidden sm:inline font-black text-sm tracking-tight">
              Career AI
            </span>
          </div>

          {/* Subtle "Shimmer" overlay effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
    </main>
  );
}