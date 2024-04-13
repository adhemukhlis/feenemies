// pages/api/auth.js
import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
// import GoogleProvider from 'next-auth/providers/google'

export const authOptions = {
	secret: process.env.SESSION_KEY,
	providers: [
		GithubProvider({
			clientId: String(process.env.GITHUB_CLIENT_ID),
			clientSecret: String(process.env.GITHUB_CLIENT_SECRET),
			authorization: {
				params: {
					scope: 'user gist'
				}
			},
			callbackUrl: 'http://localhost:3000/api/auth/callback/github'
			// callbackUrl: 'https://feenemies.vercel.app/api/auth/callback/github'
		}),
		// GoogleProvider({
		// 	clientId: process.env.GOOGLE_CLIENT_ID,
		// 	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
		// 	authorization: {
		// 		params: {
		// 			scope:
		// 				'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/documents https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.file'
		// 		}
		// 	}
		// })
	],
	session: {
		strategy: 'jwt'
	},
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
			user.provider = account.provider
			if (account.provider === 'github') {
				user.accessToken = account.access_token
				return true
			} else if (account.provider === 'google') {
				user.accessToken = account.access_token
				return true
			}
			return false
		},
		async jwt({ token, account, user, ...other }) {
			if (account) {
				token.accessToken = account.access_token
			}
			if (!!user?.provider) {
				token.provider = user?.provider
			}
			return token
		},
		async session({ session, token, ...other }) {
			session.accessToken = token.accessToken
			if (!!token?.provider) {
				session.provider = token?.provider
			}
			return session
		}
	}
}

export default NextAuth(authOptions)
