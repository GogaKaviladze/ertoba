export async function register() {
  // Supabase's connection pooler uses a self-signed certificate.
  // This flag must be set before any pg/Prisma TLS handshake occurs.
  // instrumentation.ts is the earliest hook Next.js provides — it runs
  // once at server startup, before any route handler or server action.
  // The same flag is also set in prisma.ts as a belt-and-suspenders guard.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}
