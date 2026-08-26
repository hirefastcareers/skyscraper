import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep config minimal for Vercel — avoid turbopack.root / __dirname paths
  // that break when the project is built outside the local machine.
};

export default nextConfig;
