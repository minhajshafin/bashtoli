'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, signupSchema } from '@/lib/validations/auth'

export type LoginState = {
  error: string | null
  fieldErrors?: Partial<Record<'email' | 'password', string[]>>
}

export type SignupState = {
  error: string | null
  success?: boolean
  fieldErrors?: Partial<Record<'fullName' | 'email' | 'password' | 'confirmPassword', string[]>>
}

/**
 * Server Action: Customer and admin log in.
 * Checks inputs with Zod, invokes Supabase Auth, resolves role redirects.
 */
export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string || ''

  // Validate inputs
  const parsed = loginSchema.safeParse({ email, password })
  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()
  let targetPath: string | null = null

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (error) {
      // Check for unconfirmed email errors specifically
      if (error.message.includes('Email not confirmed') || error.status === 400 && error.message.toLowerCase().includes('confirm')) {
        return {
          error: 'Please verify your email address before logging in. Check your inbox for the confirmation link.',
        }
      }
      return {
        error: 'Invalid email or password. Please try again.',
      }
    }

    if (!data.user) {
      return { error: 'Invalid email or password. Please try again.' }
    }

    // Retrieve user role from profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    // Route logic:
    // If redirectTo is provided, redirect there (as long as it starts with / to prevent open redirect)
    if (redirectTo && redirectTo.startsWith('/')) {
      targetPath = redirectTo
    } else if (profile?.role === 'staff' || profile?.role === 'admin') {
      targetPath = '/admin'
    } else {
      targetPath = '/products'
    }
  } catch (err) {
    console.error('Login action error:', err)
    return {
      error: 'An unexpected authentication error occurred. Please try again.',
    }
  }

  if (targetPath) {
    redirect(targetPath)
  }

  return { error: null }
}

/**
 * Server Action: Customer sign up.
 * Validates signup inputs and calls Supabase Auth.
 * Automatically inserts metadata so trigger handle_new_user creates full_name profile.
 */
export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Validate inputs
  const parsed = signupSchema.safeParse({
    fullName,
    email,
    password,
    confirmPassword,
  })

  if (!parsed.success) {
    return {
      error: 'Please fix the errors below.',
      fieldErrors: parsed.error.flatten().fieldErrors,
    }
  }

  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login`,
        data: {
          full_name: parsed.data.fullName,
        },
      },
    })

    if (error) {
      return {
        error: error.message || 'Failed to sign up. Please try again.',
      }
    }

    return {
      error: null,
      success: true,
    }
  } catch (err) {
    console.error('Signup action error:', err)
    return {
      error: 'An unexpected signup error occurred. Please try again.',
    }
  }
}

/**
 * Server Action: Sign out current session.
 * Clears cookie session state and redirects to storefront catalog.
 */
export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/products')
}
