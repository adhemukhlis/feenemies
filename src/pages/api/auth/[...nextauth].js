// pages/api/auth.js
import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

export default NextAuth({
	providers: [
		GithubProvider({
			clientId: String(process.env.GITHUB_CLIENT_ID),
			clientSecret: String(process.env.GITHUB_CLIENT_SECRET)
			// scope: 'gist, user'
			// callbackUrl: 'http://localhost:3000/api/auth/callback/github'
		})
	],
	callbacks: {
		// async redirect(params) {
		// 	const { url } = params

		// 	// url is just a path, e.g.: /videos/pets
		// 	if (!url.startsWith('http')) return url

		// 	// If we have a callback use only its relative path
		// 	const callbackUrl = new URL(url).searchParams.get('callbackUrl')
		// 	if (!callbackUrl) return url

		// 	return new URL(callbackUrl).pathname
		// },
		async signIn({ account, user, ...other }) {
			// console.log('signin_account', account)
			// console.log('signin_user', user)
			// console.log('signin_other', other)

			if (account.provider === 'github') {
				user.accessToken = account.access_token
				return true
			}
			return false
		},
		async jwt({ token, account, ...other }) {
			// console.log('jwt_token', token)
			// console.log('jwt_account', account)
			// console.log('jwt_other', other)
			if (account) {
				token.accessToken = account.access_token
			}
			return token
		},
		async session({ session, token, ...other }) {
			// Send properties to the client, like an access_token from a provider.
			// console.log('session_session', session)
			// console.log('session_token', token)
			// console.log('session_other', other)

			session.accessToken = token.accessToken
			return session
		}
	}
})
