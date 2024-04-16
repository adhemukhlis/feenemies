import axios from 'axios'
import { getSession } from 'next-auth/react'
import { has } from 'lodash'
import { Modal, Form, Input, Button, Table, Typography } from 'antd'
import { useRouter } from 'next/router'
import { useState } from 'react'
import routeGuard from '@/utils/route-guard'
import { IconThinPlusLarge } from '@/components/icons'
import getHumanizePastTime from '@/utils/get-humanize-past-time'
// import { addData, deleteData, getStoreData, initDB } from '@/utils/idb'
const dirNameReg = new RegExp('^[a-zA-Z0-9_-]+$', '')
let createProjectModal = {
	destroy: () => {}
}
const { Title, Text } = Typography
const HomePage = ({ projects }) => {
	const [project, setProject] = useState([])
	const router = useRouter()
	const { pathname } = router
	const [modal, contextHolder] = Modal.useModal()
	const [form] = Form.useForm()
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
			.then(async (res) => {
				// await addData('projects', { project_name: project_name, id: res.data.data.id })
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
	const showCreateProjectForm = async () => {
		createProjectModal = modal.info({
			title: 'Project Name',
			closable: true,
			okButtonProps: { style: { display: 'none' } },
			content: <CreateProjectForm />
		})
	}
	// const initDBClient = async () => {
	// 	const status = await initDB()
	// 	const users = await getStoreData('projects')
	// 	setProject(users)
	// }
	// useEffect(() => {
	// 	initDBClient()
	// }, [])
	return (
		<>
			{/* {JSON.stringify(project)}
			<button onClick={async () => await deleteData('projects', project[0].id)}>delete</button> */}
			<div>
				<div style={{ display: 'flex', width: '100%' }}>
					<div style={{ flex: 1 }}>
						<Title level={2}>Project</Title>
					</div>
					<Button onClick={showCreateProjectForm} icon={<IconThinPlusLarge />}>
						Create
					</Button>
				</div>
				<Table
					columns={[
						{
							key: 'project_name',
							dataIndex: 'project_name',
							title: 'Name',
							render: (value, record) => (
								<Button
									type="text"
									size="large"
									onClick={() => router.push({ pathname: '/project/[project_id]', query: { project_id: record.id } })}>
									{value}
								</Button>
							)
						},
						{
							key: 'updated_at',
							title: 'Updated',
							dataIndex: 'updated_at',
							width: 1,
							render: (value) => (
								<Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
									{getHumanizePastTime(value)}
								</Text>
							)
						}
					]}
					dataSource={projects}
					rowKey="id"
					pagination={false}
				/>
			</div>
			{contextHolder}
		</>
	)
}
export default HomePage

const fetchAllData = async ({ accessToken }) => {
	const perPage = 100
	let allData = []
	let currentPage = 1
	let hasMoreData = true
	while (hasMoreData) {
		const response = await axios.request({
			method: 'GET',
			url: 'https://api.github.com/gists',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				Accept: 'application/vnd.github+json'
			},
			params: {
				page: currentPage,
				per_page: perPage
			}
		})
		const data = response.data
		const capturedData = (data || []).filter((item) => String(item.description).startsWith('FEENEMIES_PROJECT_'))
		allData = allData.concat(capturedData)
		hasMoreData = data.length === perPage
		currentPage++
	}
	return allData
}

export const getServerSideProps = async (context) => {
	const session = await getSession(context)
	const accessToken = session?.accessToken
	const isLoggedIn = !!accessToken
	let projects = []
	if (has(session, 'accessToken') && session?.provider === 'github') {
		const projectList = await fetchAllData({ accessToken })
		projects = projectList.map(({ id, updated_at, description }) => {
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
