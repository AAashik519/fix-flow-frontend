import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useRegisterMutation } from '../../services/api/authApi'
import { baseApi } from '../../services/api/baseApi'
import { useAppDispatch } from '../../app/hooks'
import { setAccessToken } from '../../lib/authToken'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'

const schema = z.object({
  shopName: z.string().min(2),
  shopPhone: z.string().optional(),
  shopAddress: z.string().optional(),
  ownerName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Za-z])(?=.*\d).+$/, 'Use letters and numbers'),
})

export default function RegisterPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [registerShop, { isLoading }] = useRegisterMutation()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (values) => {
    try {
      const res = await registerShop(values).unwrap()
      setAccessToken(res.data.accessToken)
      dispatch(baseApi.util.resetApiState())
      toast.success('Shop registered')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed')
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Register your shop</h1>
      <p className="mt-1 text-sm text-ink-500">Create the owner account for a new FixFlow workspace</p>
      <form className="mt-6 grid gap-4 sm:grid-cols-2" autoComplete="off" onSubmit={handleSubmit(onSubmit)}>
        {[
          ['shopName', 'Shop name'],
          ['shopPhone', 'Shop phone'],
          ['shopAddress', 'Shop address'],
          ['ownerName', 'Owner name'],
          ['email', 'Email', 'email'],
          ['password', 'Password', 'password'],
        ].map(([name, label, type = 'text']) => (
          <div key={name} className={name === 'shopAddress' ? 'sm:col-span-2 space-y-2' : 'space-y-2'}>
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              type={type}
              autoComplete={type === 'password' ? 'new-password' : 'off'}
              readOnly={type === 'email' || type === 'password'}
              onFocus={
                type === 'email' || type === 'password'
                  ? (e) => {
                      e.target.readOnly = false
                    }
                  : undefined
              }
              {...register(name)}
            />
            {errors[name] ? <p className="text-xs text-red-600">{errors[name].message}</p> : null}
          </div>
        ))}
        <div className="sm:col-span-2">
          <Button className="w-full" type="submit" loading={isLoading} loadingText="Creating...">
            Create shop
          </Button>
        </div>
      </form>
      <p className="mt-4 text-sm text-ink-500">
        Already have an account? <Link className="font-medium text-brand-700" to="/login">Sign in</Link>
      </p>
    </div>
  )
}
