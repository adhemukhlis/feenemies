/** @type {import('next').NextConfig} */
const nextConfig = {
  publicRuntimeConfig: {
		// Will be available on both server and client
		AppName: 'FE Enemies'
	},
  env: {
		BACKEND_API_HOST: process.env.NEXT_BACKEND_API_HOST,
		SESSION_KEY: process.env.SESSION_KEY
	},
  eslint: {
		dirs: ['.']
	},
  poweredByHeader: false,
	trailingSlash: false,
	transpilePackages: ['antd'],
  reactStrictMode: false,
}

module.exports = nextConfig
