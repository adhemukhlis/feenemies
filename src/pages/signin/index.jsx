import { Button, Divider, Typography } from 'antd'
import { signIn, getSession } from 'next-auth/react'
import routeGuard from '@/utils/route-guard'
import { IconOtherGithub } from '@/components/icons'
const { Title, Text } = Typography
const SignInPage = () => {
	const githubSignInHandler = async () => {
		return await signIn('github', { scope: 'user:email gist read:gist write:gist' })
	}
	return (
		<>
			<div
				style={{
					width: '100%',
					minHeight: '100vh',
					display: 'flex',
					flexDirection: 'column',
					gap: '1rem',
					justifyContent: 'center',
					alignItems: 'center'
				}}>
				<Title level={1}>FE Enemies</Title>
				<Text type="secondary">the place of clashes between Front-end and Back-end</Text>
				<Divider type="vertical" style={{ height: '6rem' }} />
				<Button
					size="large"
					shape="round"
					icon={<IconOtherGithub />}
					style={{ backgroundColor: '#222', color: '#fafafa' }}
					onClick={githubSignInHandler}>
					Login with GitHub
				</Button>
				{/* <button onClick={() => signIn('google')}>Login with Google</button> */}
			</div>
		</>
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
