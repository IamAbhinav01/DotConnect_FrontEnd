import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { useLogin } from './useAuth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

export const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const { mutateAsync: login, isPending } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginValues) => {
    try {
      await login(values)
      toast.success('Logged in successfully!')
      navigate('/')
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password')
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold font-display tracking-tight text-text">
          Welcome back
        </h1>
        <p className="text-xs text-muted">
          Enter your credentials to access your workspaces
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="email"
          label="Email address"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isPending}>
          Sign in
        </Button>
      </form>

      <div className="text-center text-xs text-muted">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="text-pink font-semibold hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  )
}
