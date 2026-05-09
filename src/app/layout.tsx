import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Ertoba Analytics | Precision Insights',
  description: 'Premium dashboard for psychological assessments and geopolitical analytics.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ka" className="dark scroll-smooth">
      <body className={`${inter.variable} font-sans bg-slate-950 text-slate-50 antialiased selection:bg-indigo-500/30`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
