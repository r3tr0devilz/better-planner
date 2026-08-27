import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // This project has no lockfile above it, but Turbopack still walks up
  // looking for one and warns when it finds an unrelated parent one. Pin the
  // root explicitly so that warning stops.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
