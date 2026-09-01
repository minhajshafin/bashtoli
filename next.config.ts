import type { NextConfig } from "next";

// Derive the Supabase storage hostname from the env var rather than hardcoding
// the project ref (prevents project ID leaking into version control).
const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : ''

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: 'https' as const,
              hostname: supabaseHostname,
              port: '',
              pathname: '/storage/v1/object/public/**',
            },
          ]
        : []),
      {
        protocol: 'https' as const,
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
