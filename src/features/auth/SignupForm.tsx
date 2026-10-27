import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '../../shared/ui/Button'
import { Input } from '../../shared/ui/Input'
import { useSignup } from './useAuth'

const signupSchema = z
  .object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupValues = z.infer<typeof signupSchema>

export const SignupForm: React.FC = () => {
  const navigate = useNavigate()
  const { mutateAsync: signup, isPending } = useSignup()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (values: SignupValues) => {
    try {
      await signup({ email: values.email, password: values.password })
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err: any) {
      toast.error(err.message || 'Error creating account')
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-bold font-display tracking-tight text-text">
          Create an account
        </h1>
        <p className="text-xs text-muted">
          Join DotConnect to collaborate with your team
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
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <Input
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isPending}>
          Create account
        </Button>
      </form>

      <div className="text-center text-xs text-muted">
        Already have an account?{' '}
        <Link to="/login" className="text-pink font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
