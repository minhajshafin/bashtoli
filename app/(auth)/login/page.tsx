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
    alternates: {
      canonical: 'https://bashtoli.com/login',
    },
  }
}

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

  return <AuthForm type="login" />
}
