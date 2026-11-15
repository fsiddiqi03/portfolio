// The site is a static export served by GitHub Pages. NEXT_PUBLIC_BASE_PATH is the
// sub-path it lives under ("/Personal-Website-2026" for the project site); leave it
// unset to serve from a domain root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath,
  // Let other devices on the tailnet load dev resources (JS, HMR) from this server.
  allowedDevOrigins: ["100.78.22.29"],
};

export default nextConfig;
