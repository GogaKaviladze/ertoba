'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { ensureUserExists } from '@/services/userService'
import { AccountType } from '@prisma/client'
import { rateLimit } from '@/lib/rateLimit'
import { loginSchema, signupSchema } from '@/lib/validation'

async function syncUserSafely(userId: string, email: string | undefined, accountType: AccountType) {
  try {
    if (!email) return
    await ensureUserExists(userId, email, accountType)
  } catch (err) {
    // Do not block authentication if Prisma/DB is temporarily unreachable.
    console.error('User sync skipped:', err)
  }
}

export async function login(formData: FormData) {
  const accountType = formData.get('accountType') as AccountType || 'PERSONAL'
  const rawEmail = formData.get('email')
  const rawPassword = formData.get('password')
  let email = typeof rawEmail === 'string' ? rawEmail.trim() : ''
  let password = typeof rawPassword === 'string' ? rawPassword : ''

  // Validate inputs before any further processing.
  const parsed = loginSchema.safeParse({ email, password, accountType })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.', success: false }
  }
  email = parsed.data.email
  password = parsed.data.password

  // Limit login attempts per email to 10 per minute to mitigate brute-force.
  const rl = rateLimit(`login:${email}`, 10)
  if (!rl.allowed) {
    return { error: 'Too many login attempts. Please try again later.', success: false }
  }

  // For PERSONAL logins, the "email" field in UI is the Private Key
  // We mapped it to password in the form hidden fields if it was a signup,
  // but for login we need to handle it.
  if (accountType === 'PERSONAL' && !email.includes('@')) {
    const key = email
    email = `${key}@ertoba.anon`
    password = key
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message, success: false }
  }

  // Sync user to Prisma after login
  if (data.user) {
    await syncUserSafely(data.user.id, data.user.email ?? undefined, accountType)
  }

  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const accountType = formData.get('accountType') as AccountType || 'PERSONAL'
  const rawEmail = formData.get('email')
  const rawPassword = formData.get('password')
  const email = typeof rawEmail === 'string' ? rawEmail.trim() : ''
  const password = typeof rawPassword === 'string' ? rawPassword : ''

  // Validate inputs before any further processing.
  const parsed = signupSchema.safeParse({ email, password, accountType })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input.', success: false }
  }

  // Limit signup attempts per email to 5 per minute to mitigate abuse.
  const rl = rateLimit(`signup:${parsed.data.email}`, 5)
  if (!rl.allowed) {
    return { error: 'Too many signup attempts. Please try again later.', success: false }
  }

  const supabase = await createClient()

  // Use localized site URL fallback
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // For PERSONAL accounts, use the admin client to auto-confirm the email so that
  // the @ertoba.anon address (which can never receive mail) does not block login.
  if (accountType === 'PERSONAL') {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceRoleKey) {
      return {
        error: 'Personal sign-up requires SUPABASE_SERVICE_ROLE_KEY in .env.local. This flow is anonymous and cannot use email confirmation.',
        success: false,
      }
    }

    const adminClient = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey
    )

    const { data: adminData, error: adminError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (adminError) {
      return { error: adminError.message, success: false }
    }

    // Sign in immediately with the newly confirmed account
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError || !loginData.session) {
      return { error: loginError?.message || 'Authentication failed after account creation', success: false }
    }

    if (adminData.user) {
      await syncUserSafely(adminData.user.id, email, accountType)
    }

    redirect('/dashboard')
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.toLowerCase().includes('error sending confirmation email')) {
      return {
        error: 'Supabase could not send a confirmation email. Configure SMTP in Supabase Auth settings or disable email confirmation for this project.',
        success: false,
      }
    }
    return { error: error.message, success: false }
  }

  // Sync user to Prisma after signup
  if (data.user) {
    await syncUserSafely(data.user.id, data.user.email ?? undefined, accountType)
  }

  // If email confirmation is OFF, Supabase returns a session immediately
  if (data.session) {
    redirect('/dashboard')
  }

  return { 
    success: true, 
    message: 'Registration successful! Please check your email for confirmation.' 
  }
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
