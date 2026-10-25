import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The engine lives next to the app and uses Node's built-in crypto.
  serverExternalPackages: [],
};

export default nextConfig;
