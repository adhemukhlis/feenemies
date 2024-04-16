import { getSession } from 'next-auth/react'
import routeGuard from '@/utils/route-guard'
const RedirectEmpty = () => {
	return <></>
}
export default RedirectEmpty
export const getServerSideProps = async (context) => {
	const session = await getSession(context)
	const accessToken = session?.accessToken
	const isLoggedIn = !!accessToken
	return routeGuard([isLoggedIn], '/signin', {
		redirect: {
			destination: '/home',
			permanent: false
		}
	})
}
