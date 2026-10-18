import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useResetPasswordMutation } from '../../services/api/authApi'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters').regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Use letters and numbers'),
})

export default function ResetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const navigate = useNavigate()
  const [resetPassword, { isLoading }] = useResetPasswordMutation()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values) => {
    try {
      await resetPassword({ token, password: values.password }).unwrap()
      toast.success('Password updated')
      navigate('/login')
    } catch (err) {
      toast.error(err?.data?.message || 'Reset link is invalid or expired')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Choose a new password</h1>
      <p className="mt-1 text-sm text-ink-500">Use at least 8 characters, with a letter and a number.</p>
      {!token ? (
        <p className="mt-6 text-sm text-red-600">This reset link is missing a token.</p>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
          </div>
          <Button className="w-full" type="submit" loading={isLoading} loadingText="Saving…">Update password</Button>
        </form>
      )}
      <p className="mt-4 text-sm text-ink-500">
        <Link className="font-medium text-brand-700" to="/login">Back to sign in</Link>
      </p>
    </div>
  )
}
