import { Outlet, Link } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#193931_0%,#286855_45%,#1a2430_100%)]" />
      <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-brand-300/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-sky-300/10 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">
        <div className="mb-8 text-white lg:mb-0">
          <Link to="/" className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            FixFlow
          </Link>
          <p className="mt-4 max-w-md text-lg text-white/80">
            Centralize intake, repairs, parts, payments, and customer tracking for your electronics repair shop.
          </p>
        </div>
        <div className="rounded-2xl border border-white/15 bg-white/95 p-6 shadow-2xl backdrop-blur sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
