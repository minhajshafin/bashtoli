import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthForm } from '@/components/storefront/auth-form'

export async function generateMetadata() {
  return {
    title: 'Create Account | Bashtoli',
    description: 'Join Bashtoli to track orders and save shipping addresses.',
  }
}

/**
 * Storefront Signup Page.
 * Server component that redirects active auth users immediately and renders the Signup Form.
 */
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
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Join Bashtoli to save addresses and track orders
          </p>
        </div>

        <AuthForm type="signup" />
      </div>
    </div>
  )
}
