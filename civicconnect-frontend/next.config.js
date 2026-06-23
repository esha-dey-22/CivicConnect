/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/admin/:path*',
        destination: '/api/admin/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:5001/:path*',
      },
    ]
  },
};

module.exports = nextConfig;
