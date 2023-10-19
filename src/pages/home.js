import axios from 'axios'
import { signOut, useSession, getSession } from 'next-auth/react'
import { get, has } from 'lodash'
import Link from 'next/link'
import routeGuard from '@/utils/route-guard'
const HomePage = ({ projectData }) => {
	const { data: session } = useSession()
	const projectList = get(projectData, ['project_list'], [])
	return (
		<div>
			<p>Welcome, {session?.user?.name}!</p>
			<button onClick={() => signOut()}>Sign out</button>
			<h2>Project</h2>
			<ol>
				{projectList.map((item, index) => (
					<li key={index}>
						<Link href="/workspace/1">{item.project_name}</Link>
					</li>
				))}
			</ol>
		</div>
	)
}
export default HomePage

export const getServerSideProps = async (context) => {
	const session = await getSession(context)
	const accessToken = session?.accessToken
	const isLoggedIn = !!accessToken
	let projectData = {}
	if (has(session, 'accessToken')) {
		const res = await axios.request({
			method: 'GET',
			url: 'https://api.github.com/gists',
			headers: {
				Authorization: `Bearer ${session?.accessToken}`,
				Accept: 'application/vnd.github+json'
			}
		})
		const resProjectData = res.data.filter((item) => item.description === '__FEENEMIES_PROJECT_DATA__')[0]
		const resFile = resProjectData?.id
		const resDetail = await axios.request({
			method: 'GET',
			url: 'https://api.github.com/gists/' + resFile,
			headers: {
				Authorization: `Bearer ${session?.accessToken}`
			}
		})
		const content = JSON.parse(get(resDetail, ['data', 'files', 'feenemies-project-data.json', 'content']))

		projectData = content
	}

	return routeGuard([isLoggedIn], '/', {
		props: {
			projectData
		}
	})
}
