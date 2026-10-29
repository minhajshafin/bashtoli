'use client'

import React from 'react'
import { ProfileInfoSection } from './profile/profile-info-section'
import { ProfilePasswordSection } from './profile/profile-password-section'
import { DeleteAccountModal } from './profile/delete-account-modal'

interface ProfileFormProps {
  profile: {
    id: string
    full_name: string | null
    phone: string | null
    address: string | null
    role: string
  } | null
  email: string | null
}

/**
 * Customer Profile Settings Form.
 * Dedicated mobile-first layout with grouped inset sections, 48px tactile inputs,
 * direct inline editing, and smooth animated security accordions.
 */
export function ProfileForm({ profile, email }: ProfileFormProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      <ProfileInfoSection profile={profile} email={email} />
      <ProfilePasswordSection />
      <DeleteAccountModal />
    </div>
  )
}
