import { Avatar, Button, Divider, Result, Typography } from 'antd'
import { getSession } from 'next-auth/react'
import axios from 'axios'
import React from 'react'
import routeGuard from '@/utils/route-guard'
const { Title, Text } = Typography
const ProfilePage = ({ userData, userDataStatus }) => {
	const goToGithub = () => {
		window.open(userData.github_profile, '_blank')
	}
	return (
		<>
			{userDataStatus === 200 ? (
				<div
					style={{
						padding: '1rem',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '1rem'
					}}>
					<Avatar
						style={{ width: '10rem', aspectRatio: '1 / 1', height: 'fit-content' }}
						src={userData?.image || `https://ui-avatars.com/api/?name=${userData?.username}`}
					/>
					<Title level={2}>{userData.name}</Title>
					<span>
						<Button type="text" onClick={goToGithub}>
							<Text>{userData.username}</Text>
						</Button>
						<Divider type="vertical" />
						<Text style={{ marginLeft: '1rem' }}>{userData.email ?? 'not-set'}</Text>
					</span>
				</div>
			) : (
				<Result
					status="404"
					title="404"
					subTitle="Sorry, the page you visited does not exist."
					// extra={<Button type="primary">Back Home</Button>}
				/>
			)}
		</>
	)
}
export default ProfilePage
const getGithubUser = async ({ username, accessToken }) => {
	return await axios
		.request({
			method: 'GET',
			url: `https://api.github.com/users/${username ?? ''}`,
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		})
		.catch((err) => {
			return { status: 404 }
		})
}
export const getServerSideProps = async (context) => {
	let userData = {}
	let userDataStatus = 500
	const { params } = context
	const session = await getSession(context)
	// console.log(session)
	const accessToken = session?.accessToken
	const isLoggedIn = !!accessToken
	if (isLoggedIn) {
		const githubUser = await getGithubUser({
			username: 'username' in params ? params.username[0] : session.user.username,
			accessToken
		})
		userDataStatus = githubUser.status
		if (githubUser.status === 200) {
			userData = {
				username: githubUser?.data?.login,
				name: githubUser?.data?.name,
				image: githubUser?.data?.avatar_url,
				email: githubUser?.data?.email,
				github_profile: githubUser?.data?.html_url
			}
		}
	}

	return routeGuard([isLoggedIn], '/', {
		props: { userData, userDataStatus }
	})
}
