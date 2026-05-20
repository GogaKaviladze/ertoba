'use client'

import { Mail, Shield, Coins } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/lib/i18n/LanguageContext'

type ProfileIdentity = {
  displayName: string
  displayEmail: string
  tierKey: string
  initials: string
  isTokenUser: boolean
}

type Props = {
  profile: ProfileIdentity
  balance: number
}

export function ProfileView({ profile, balance }: Props) {
  const { t } = useLanguage()

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{t('profileTitle')}</h1>
        <p className="text-slate-400">{t('profileSubtitle')}</p>
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
                  <Shield className="h-4 w-4" /> {t(profile.tierKey)}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400/10 px-3 py-1 text-sm font-medium text-yellow-400 ring-1 ring-inset ring-yellow-400/20">
                  <Coins className="h-4 w-4" /> {balance.toLocaleString()} ERTC
                </span>
              </div>

              {!profile.isTokenUser && (
                <div className="pt-6 flex flex-col sm:flex-row justify-center sm:justify-start gap-3">
                  <Button className="h-10 px-6 bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 font-semibold border-0">
                    {t('profileEditBtn')}
                  </Button>
                  <Button variant="outline" className="h-10 px-6 border-indigo-500/30 bg-indigo-500/5 text-slate-300 hover:bg-indigo-500/10 hover:text-white font-semibold transition-all">
                    {t('profilePasswordBtn')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
