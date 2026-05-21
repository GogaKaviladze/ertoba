'use client'

import React, { useState } from 'react'
import { login, signup } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldCheck, Mail, Lock, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/i18n/LanguageContext'

export default function LoginPage() {
  const { t } = useLanguage()
  const [accountType, setAccountType] = useState<'B2B' | 'PERSONAL' | null>(null)
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    formData.append('accountType', accountType || 'PERSONAL')

    try {
      const result = (isLogin ? await login(formData) : await signup(formData)) as { error?: string, success?: boolean, message?: string }

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      } else if (result?.success) {
        setMessage(result.message || 'Success!')
        setIsLoading(false)
      } else {
        setIsLoading(false)
      }
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'digest' in error &&
        typeof (error as { digest?: unknown }).digest === 'string' &&
        (error as { digest: string }).digest.includes('NEXT_REDIRECT')
      ) {
        return
      }

      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  const generateAnonymousKey = () => {
    const key = `ertoba-key-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`
    setGeneratedKey(key)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden">
      {/* Background orbs — desktop only to avoid GPU-intensive blur on mobile */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] hidden sm:block" aria-hidden="true" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] hidden sm:block" aria-hidden="true" />

      <div className="animate-in fade-in zoom-in-95 duration-500 ease-out z-10 w-full max-w-md px-4">

        {/* Mission Banner */}
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-3">
          <div className="shrink-0 p-1.5 rounded-lg bg-indigo-500/20">
            <BarChart3 className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-300">{t('loginBannerTitle')}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{t('loginBannerSubtitle')}</p>
          </div>
        </div>

        <Card className="glass-morphism border-white/10 overflow-hidden">
          <CardContent className="p-8">
            {!accountType ? (
              <div className="space-y-6">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 ring-1 ring-indigo-500/50">
                    <ShieldCheck className="h-6 w-6 text-indigo-400" />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight text-center">
                    {t('loginChooseTitle')}
                  </h1>
                  <p className="text-sm text-slate-400 mt-1 text-center">
                    {t('loginChooseSubtitle')}
                  </p>
                </div>

                <div className="grid gap-4">
                  <button
                    onClick={() => setAccountType('PERSONAL')}
                    className="group flex flex-col items-start p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-teal-500/30 transition-all text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">🔒</span>
                      <span className="text-white font-bold group-hover:text-teal-300 transition-colors">{t('loginAnonTitle')}</span>
                    </div>
                    <span className="text-xs text-slate-500">{t('loginAnonDesc')}</span>
                  </button>

                  <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {t('loginOrgContact')}{' '}
                      <a
                        href="mailto:ertoba@anthronode.io"
                        className="text-indigo-400 hover:text-indigo-300 transition-colors font-mono"
                      >
                        ertoba@anthronode.io
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col items-center mb-8">
                  <button
                    onClick={() => setAccountType(null)}
                    className="text-[10px] text-slate-600 uppercase tracking-widest hover:text-white transition-colors mb-4"
                  >
                    {t('loginBack')}
                  </button>
                  <div className={`w-12 h-12 ${accountType === 'B2B' ? 'bg-indigo-500/20' : 'bg-teal-500/20'} rounded-xl flex items-center justify-center mb-4 ring-1 ${accountType === 'B2B' ? 'ring-indigo-500/50' : 'ring-teal-500/50'}`}>
                    <ShieldCheck className={`h-6 w-6 ${accountType === 'B2B' ? 'text-indigo-400' : 'text-teal-400'}`} />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    {accountType === 'B2B'
                      ? (isLogin ? t('loginOrgLogin') : t('loginRegisterOrg'))
                      : (isLogin ? t('loginPersonalLogin') : t('loginCreatePrivacy'))}
                  </h1>
                </div>

                {accountType === 'PERSONAL' && !isLogin && !generatedKey ? (
                  <div className="space-y-6">
                    <p className="text-xs text-slate-400 text-center leading-relaxed">
                      {t('loginKeyDesc')}
                    </p>
                    <Button
                      onClick={generateAnonymousKey}
                      className="w-full bg-teal-600 hover:bg-teal-500 text-white h-11 font-semibold"
                    >
                      {t('loginGenerateKey')}
                    </Button>
                  </div>
                ) : generatedKey ? (
                  <div className="space-y-6">
                    <div className="p-4 bg-black/40 border border-teal-500/30 rounded-lg break-all">
                      <p className="text-[10px] text-teal-400 uppercase tracking-widest mb-2 font-bold">{t('loginKeyLabel')}</p>
                      <code className="text-xs text-teal-50 font-mono">{generatedKey}</code>
                    </div>
                    <p className="text-[10px] text-red-400 text-center uppercase font-bold animate-pulse">
                      {t('loginKeyCopyWarning')}
                    </p>
                    {error && (
                      <p className="text-xs text-red-400 text-center font-medium">{error}</p>
                    )}
                    {message && (
                      <p className="text-xs text-teal-400 text-center font-medium">{message}</p>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <input type="hidden" name="email" value={`${generatedKey}@ertoba.anon`} />
                      <input type="hidden" name="password" value={generatedKey} />
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white h-11 font-semibold"
                      >
                        {isLoading ? t('loginProcessing') : t('loginKeySaved')}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                        <Input
                          name="email"
                          type={accountType === 'B2B' ? 'email' : 'text'}
                          placeholder={accountType === 'B2B' ? 'Email' : t('loginKeyPlaceholder')}
                          required
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 h-11"
                        />
                      </div>
                      {accountType === 'B2B' && (
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                          <Input
                            name="password"
                            type="password"
                            placeholder="Password"
                            required
                            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 h-11"
                          />
                        </div>
                      )}
                      {accountType === 'PERSONAL' && isLogin && (
                        <input type="hidden" name="password" value="dummy" />
                      )}
                    </div>

                    {error && (
                      <p className="text-xs text-red-400 text-center font-medium">{error}</p>
                    )}
                    {message && (
                      <p className="text-xs text-teal-400 text-center font-medium">{message}</p>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full ${accountType === 'B2B' ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-teal-600 hover:bg-teal-500'} text-white h-11 font-semibold transition-all active:scale-[0.98]`}
                    >
                      {isLoading
                        ? t('loginProcessing')
                        : isLogin
                          ? t('loginSignInBtn')
                          : accountType === 'B2B'
                            ? t('loginRegisterOrgBtn')
                            : t('loginCreateIdentity')}
                    </Button>
                  </form>
                )}

                {/* Hide account-switch section once a key has been generated */}
                {!generatedKey && (
                  <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                    <p className="text-xs text-slate-500">
                      {isLogin ? t('loginNoAccount') : t('loginHaveAccount')}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin)
                        if (!isLogin) setAccountType(null)
                      }}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest px-4 py-2"
                    >
                      {isLogin ? t('loginSwitchSignUp') : t('loginSwitchSignIn')}
                    </button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 flex flex-col items-center gap-2">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest">
            {t('loginFooterSecured')}
          </p>
          <Link href="/" className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
            {t('loginBackHome')}
          </Link>
        </div>
      </div>
    </div>
  )
}
