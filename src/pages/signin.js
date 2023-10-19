import { signIn, getSession } from 'next-auth/react'
import routeGuard from '@/utils/route-guard'
const SignInPage = () => {
	return (
		<div>
			<div>
				<button onClick={() => signIn('github', { scope: 'user:email gist read:gist write:gist' })}>
					Login with GitHub
				</button>
			</div>
		</div>
	)
}
export default SignInPage

export const getServerSideProps = async (context) => {
	const session = await getSession(context)
	const accessToken = session?.accessToken
	const isLoggedOut = !accessToken
	return routeGuard([isLoggedOut], '/', {
		props: {}
	})
}
