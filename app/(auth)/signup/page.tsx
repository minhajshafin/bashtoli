import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthForm } from '@/components/storefront/auth-form'

export async function generateMetadata() {
  return {
    title: 'Create Account | Bashtoli',
    description: 'Join Bashtoli to save addresses, build wishlists, and track orders.',
    alternates: {
      canonical: 'https://bashtoli.com/signup',
    },
  }
}

import { Suspense } from 'react'

export default async function SignupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is already authenticated, redirect them away to products catalog
  if (user) {
    redirect('/products')
  }

  return (
    <Suspense>
      <AuthForm type="signup" />
    </Suspense>
  )
}
