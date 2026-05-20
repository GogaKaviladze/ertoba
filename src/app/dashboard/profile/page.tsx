import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserBalance } from '@/services/userService'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import { ProfileView } from '@/components/features/profile/ProfileView'

function buildProfileIdentity(email: string | undefined, userId: string) {
  if (!email) {
    return {
      displayName: 'Ertoba User',
      displayEmail: `ID ${userId.slice(0, 8)}`,
      tierKey: 'profileTierSecure',
      initials: 'EU',
      isTokenUser: true,
    }
  }

  if (email.endsWith('@ertoba.anon')) {
    const tokenLabel = email.replace('@ertoba.anon', '')
    return {
      displayName: 'Private Identity',
      displayEmail: tokenLabel,
      tierKey: 'profileTierZeroKnowledge',
      initials: 'PI',
      isTokenUser: true,
    }
  }

  const localPart = email.split('@')[0]
  const words = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))

  const displayName = words.length > 0 ? words.join(' ') : 'Ertoba User'
  const initials = words.slice(0, 2).map((part) => part[0]).join('') || 'EU'

  return {
    displayName,
    displayEmail: email,
    tierKey: 'profileTierVerified',
    initials,
    isTokenUser: false,
  }
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = buildProfileIdentity(user.email ?? undefined, user.id)
  const balance = await getUserBalance(user.id)

  return (
    <LanguageProvider>
      <ProfileView profile={profile} balance={balance} />
    </LanguageProvider>
  )
}
