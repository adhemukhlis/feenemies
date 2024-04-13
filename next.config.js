/** @type {import('next').NextConfig} */
const nextConfig = {
	publicRuntimeConfig: {
		// Will be available on both server and client
		AppName: 'FE Enemies'
	},
	// env: {
	// 	BACKEND_API_HOST: process.env.NEXT_BACKEND_API_HOST,
	// 	SESSION_KEY: process.env.SESSION_KEY
	// },
	eslint: {
		dirs: ['.']
	},
	poweredByHeader: false,
	trailingSlash: false,
	transpilePackages: ['antd'],
	reactStrictMode: false,
	// cors allow all
	async headers() {
		return [
			{
				// matching all API routes
				source: '/api/:path*',
				headers: [
					{ key: 'Access-Control-Allow-Credentials', value: 'true' },
					{ key: 'Access-Control-Allow-Origin', value: '*' }, // replace this your actual origin
					{ key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
					{
						key: 'Access-Control-Allow-Headers',
						value:
							'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
					}
				]
			}
		]
	}
}

module.exports = nextConfig
