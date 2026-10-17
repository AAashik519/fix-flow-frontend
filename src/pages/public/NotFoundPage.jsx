import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <h1 className="font-display text-4xl font-bold">404</h1>
      <p className="mt-2 text-ink-500">Page not found</p>
      <Link className="mt-4 text-brand-700" to="/">Go home</Link>
    </div>
  )
}
