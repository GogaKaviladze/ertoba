import type { NextConfig } from "next";

const allowedOrigins = ["localhost:3000", "192.168.2.86:3000"];

// Include the deployed site origin so server actions work in production
if (process.env.NEXT_PUBLIC_SITE_URL) {
  try {
    const siteHost = new URL(process.env.NEXT_PUBLIC_SITE_URL).host;
    if (!allowedOrigins.includes(siteHost)) {
      allowedOrigins.push(siteHost);
    }
  } catch {
    // Invalid URL – skip
    console.warn('Invalid NEXT_PUBLIC_SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
  }
}

const nextConfig: NextConfig = {
  // Prevent Turbopack from bundling native Node.js packages — required so
  // pg's TLS options (including functions like checkServerIdentity) are
  // preserved at runtime instead of being lost during bundling.
  serverExternalPackages: ['pg', '@prisma/adapter-pg'],
  experimental: {
    serverActions: {
      allowedOrigins,
    },
  },
};

export default nextConfig;
