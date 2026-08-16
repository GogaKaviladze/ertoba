import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login & Anonymous Access | Ertoba',
  description: 'Access your anonymous profile or generate a private zero-knowledge access key.',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
