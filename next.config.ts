import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The subdomain root (interact.welcome.us/) defaults to the lead-generation
  // variant. Redirecting to /exam keeps one canonical URL per variant instead
  // of serving identical content at both / and /exam. 307 (temporary) while the
  // canonical paths are still being finalized; incoming query values (UTMs)
  // are carried through to the destination automatically.
  async redirects() {
    return [
      {
        source: "/",
        destination: "/exam",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
