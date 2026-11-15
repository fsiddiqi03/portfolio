/** @type {import('next').NextConfig} */
const nextConfig = {
  // Let other devices on the tailnet load dev resources (JS, HMR) from this server.
  allowedDevOrigins: ["100.78.22.29"],
};
export default nextConfig;
