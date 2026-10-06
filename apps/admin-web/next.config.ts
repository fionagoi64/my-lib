import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@library/ui", "@library/api"],
};

export default nextConfig;
