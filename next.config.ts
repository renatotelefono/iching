import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ❌ Ignora gli errori ESLint durante la build su Vercel
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ❌ Ignora errori di TypeScript solo in fase di build (se serve)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
