import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const prismaClientSingleton = () => {
  // Turbopack bundles prisma.ts and loses the ssl function properties from the
  // pg Pool config at runtime. The only reliable way to bypass Supabase's
  // self-signed pooler cert on Vercel is the Node.js global TLS flag.
  // Safe in serverless: each invocation is isolated, only Supabase is contacted.
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool as unknown as Parameters<typeof PrismaPg>[0])
  return new PrismaClient({ adapter })
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
