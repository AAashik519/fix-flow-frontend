import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useForgotPasswordMutation } from '../../services/api/authApi'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
})

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values) => {
    try {
      await forgotPassword(values).unwrap()
      setSent(true)
    } catch (err) {
      toast.error(err?.data?.message || 'Could not send reset email')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Forgot password</h1>
      <p className="mt-1 text-sm text-ink-500">We will email you a link to choose a new password.</p>
      {sent ? (
        <p className="mt-6 text-sm text-ink-700">
          If that email is registered, a reset link is on its way. The link expires in 30 minutes.
        </p>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
          </div>
          <Button className="w-full" type="submit" loading={isLoading} loadingText="Sending…">Send reset link</Button>
        </form>
      )}
      <p className="mt-4 text-sm text-ink-500">
        <Link className="font-medium text-brand-700" to="/login">Back to sign in</Link>
      </p>
    </div>
  )
}
