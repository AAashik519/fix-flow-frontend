import { Link } from 'react-router-dom'

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-3xl font-bold">Access denied</h1>
      <p className="mt-2 text-ink-500">You do not have permission to view this page.</p>
      <Link className="mt-4 text-brand-700" to="/">Go home</Link>
    </div>
  )
}
