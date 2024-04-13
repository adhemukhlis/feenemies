import axios from 'axios'
import { signOut, useSession, getSession } from 'next-auth/react'
import { has } from 'lodash'
import Link from 'next/link'
import { Modal, Form, Input, Button } from 'antd'
import { useRouter } from 'next/router'
import { useState } from 'react'
import routeGuard from '@/utils/route-guard'
const dirNameReg = new RegExp('^[a-zA-Z0-9_-]+$', '')
let createProjectModal = {
	destroy: () => {}
}
const HomePage = ({ projects }) => {
	const router = useRouter()
	const { pathname } = router
	const [modal, contextHolder] = Modal.useModal()
	const [form] = Form.useForm()
	const { data: session } = useSession()
	// const projectList = get(projectData, ['project_list'], [])
	// const createDoc = async() => {
	// 	setLoading(true)
	// 	axios.request({
	// 		method:'POST',
	// 		url: 'https://content-docs.googleapis.com/v1/documents?alt=json&key=AIzaSyBt6YWTdEhulMbRLRm7wHbLT84m4N1iHHk',
	// 		headers: {
	// 			Authorization: `Bearer ${session?.accessToken}`
	// 		},
	// 		data: {
	// 			title: 'feenemies document'
	// 		}
	// 	}).finally(()=>{
	// 		setLoading(false)
	// 	})
	// }
	const createProject = async ({ project_name }, setLoading) => {
		setLoading(true)
		axios
			.request({
				method: 'POST',
				url: '/api/project/create',
				data: {
					project_name
				}
			})
			.then(() => {
				createProjectModal.destroy()
				router.replace({ pathname })
			})
			.finally(() => {
				setLoading(false)
			})
	}
	const CreateProjectForm = () => {
		const [loading, setLoading] = useState(false)
		return (
			<Form form={form} onFinish={(values) => createProject(values, setLoading)}>
				<Form.Item
					name="project_name"
					rules={[
						{ required: true, message: 'Please enter project name!' },
						{
							pattern: dirNameReg,
							message: 'Please enter a valid project name!'
						}
					]}>
					<Input />
				</Form.Item>
				<Form.Item>
					<div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
						<Button htmlType="submit" loading={loading}>
							Create
						</Button>
					</div>
				</Form.Item>
			</Form>
		)
	}
	const showCreateProjectForm = () => {
		createProjectModal = modal.info({
			title: 'Project Name',
			closable: true,
			okButtonProps: { style: { display: 'none' } },
			content: <CreateProjectForm />
		})
	}
	return (
		<>
			<div>
				<p>Welcome, {session?.user?.name}!</p>
				<Button onClick={() => signOut()}>Sign out</Button>
				{/* <button onClick={createDoc}>{loading? 'wait':'create'}</button> */}
				<Button onClick={showCreateProjectForm}>Create</Button>
				<h2>Project</h2>
				<ol>
					{projects.map((item, index) => (
						<li key={index}>
							<Link href={`/project/${item.id}`}>{item.project_name}</Link>
						</li>
					))}
				</ol>
			</div>
			{contextHolder}
		</>
	)
}
export default HomePage

export const getServerSideProps = async (context) => {
	const session = await getSession(context)
	const accessToken = session?.accessToken
	const isLoggedIn = !!accessToken
	let projects = []
	if (has(session, 'accessToken') && session?.provider === 'github') {
		const res = await axios.request({
			method: 'GET',
			url: 'https://api.github.com/gists',
			headers: {
				Authorization: `Bearer ${session?.accessToken}`,
				Accept: 'application/vnd.github+json'
			}
		})
		// console.log(res.data)
		const resProjects = res.data.filter((item) => String(item.description).startsWith('FEENEMIES_PROJECT_'))
		// const resFile = resProjectData?.id
		// const resDetail = await axios.request({
		// 	method: 'GET',
		// 	url: 'https://api.github.com/gists/' + resFile,
		// 	headers: {
		// 		Authorization: `Bearer ${session?.accessToken}`
		// 	}
		// })
		// const content = JSON.parse(get(resDetail, ['data', 'files', 'feenemies-project-info.json', 'content']))

		projects = resProjects.map(({ id, updated_at, description }) => {
			const sliced_description = description.split('_')
			return { id, updated_at, project_name: sliced_description.slice(3, sliced_description.length).join('_') }
		})
	}

	return routeGuard([isLoggedIn], '/', {
		props: {
			projects
		}
	})
}
