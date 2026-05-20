import { Mail, Shield, Coins } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { getUserBalance } from '@/services/userService'

function buildProfileIdentity(email: string | undefined, userId: string) {
  if (!email) {
    return {
      displayName: 'Ertoba User',
      displayEmail: `ID ${userId.slice(0, 8)}`,
      tierLabel: 'Secure Session',
      initials: 'EU',
      isTokenUser: true,
    }
  }

  if (email.endsWith('@ertoba.anon')) {
    const tokenLabel = email.replace('@ertoba.anon', '')
    return {
      displayName: 'Private Identity',
      displayEmail: tokenLabel,
      tierLabel: 'Zero-Knowledge',
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
    tierLabel: 'Verified Account',
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
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Profile Settings</h1>
        <p className="text-slate-400">Manage your account information and preferences.</p>
      </div>

      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
            <Avatar className="h-32 w-32 border-4 border-indigo-500/20">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-3xl font-bold text-white">
                {profile.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <h2 className="text-2xl font-bold text-white">{profile.displayName}</h2>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-slate-400 mt-1">
                  <Mail className="h-4 w-4" />
                  <span>{profile.displayEmail}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
                  <Shield className="h-4 w-4" /> {profile.tierLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-3 py-1 text-sm font-medium text-yellow-400 ring-1 ring-inset ring-yellow-400/20">
                  <Coins className="h-4 w-4" /> {balance.toLocaleString()} ERTC
                </span>
              </div>
              
              {!profile.isTokenUser && (
                <div className="pt-6 flex flex-col sm:flex-row justify-center sm:justify-start gap-3">
                  <Button className="h-10 px-6 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 font-semibold border-0">
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="h-10 px-6 border-indigo-500/30 bg-indigo-500/5 text-slate-300 hover:bg-indigo-500/10 hover:text-white font-semibold transition-all">
                    Change Password
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Privacy settings and other stuff can go here */}
    </div>
  )
}
