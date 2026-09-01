import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthForm } from '@/components/storefront/auth-form'

interface LoginPageProps {
  searchParams: Promise<{
    redirectTo?: string
  }>
}

export async function generateMetadata() {
  return {
    title: 'Sign In | Bashtoli',
    description: 'Sign in to your Bashtoli account to view orders and manage saved details.',
  }
}

/**
 * Storefront Login Page.
 * Server component that redirects active auth users immediately and renders the Login Form.
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams
  const rawRedirectTo = resolvedSearchParams?.redirectTo
  const redirectTo =
    rawRedirectTo && /^\/[^/]/.test(rawRedirectTo)
      ? rawRedirectTo
      : '/products'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is already authenticated, redirect them away
  if (user) {
    redirect(redirectTo)
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1
            className="text-3xl font-extrabold tracking-tight text-forest-900"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Welcome Back
          </h1>
          <p className="mt-1 text-sm text-forest-600">
            Sign in to access your Bashtoli account
          </p>
        </div>

        <AuthForm type="login" />
      </div>
    </div>
  )
}

