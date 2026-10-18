import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useLoginMutation } from '../../services/api/authApi'
import { baseApi } from '../../services/api/baseApi'
import { useAppDispatch } from '../../app/hooks'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values) => {
    try {
      const res = await login(values).unwrap()
      dispatch(baseApi.util.resetApiState())
      toast.success('Welcome back')
      navigate(res.data.user.role === 'TECHNICIAN' ? '/technician' : '/dashboard')
    } catch (err) {
      toast.error(err?.data?.message || err?.message || 'Login failed')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Sign in</h1>
      <p className="mt-1 text-sm text-ink-500">Access your FixFlow workspace</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {errors.email ? <p className="text-xs text-red-600">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...register('password')} />
          {errors.password ? <p className="text-xs text-red-600">{errors.password.message}</p> : null}
        </div>
        <Button className="w-full" type="submit" loading={isLoading} loadingText="Signing in...">Sign in</Button>
      </form>
      <p className="mt-4 text-sm text-ink-500">
        New shop? <Link className="font-medium text-brand-700" to="/register">Register</Link>
      </p>
    </div>
  )
}
