import React from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AuthForm } from '@/components/storefront/auth-form'

export async function generateMetadata() {
  return {
    title: 'Create Account',
    description: 'Join Bashtoli to save addresses, build wishlists, and track orders.',
    alternates: {
      canonical: 'https://bashtoli.com/signup',
    },
  }
}


interface SignupPageProps {
  searchParams?: Promise<{
    redirectTo?: string
  }>
}

export const instant = false

export default async function SignupPage({ searchParams }: SignupPageProps) {
  await connection()
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const rawRedirectTo = resolvedSearchParams?.redirectTo

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is already authenticated, redirect them away to products catalog
  if (user) {
    redirect('/products')
  }

  return <AuthForm type="signup" redirectTo={rawRedirectTo || ''} />
}
