import axios from 'axios'

import { getServerSession } from 'next-auth/next'
import lz from 'lz-string'
import { authOptions } from '../../auth/[...nextauth]'
const api = async (req, res) => {
	const session = await getServerSession(req, res, authOptions)

	const ts = Date.now()
	const { project_name } = req.body
	if (req.method === 'POST') {
		try {
			const content = JSON.stringify({ project_name: project_name })
			const compressed_content = lz.compress(content)
			const response = await axios.request({
				method: 'POST',
				url: 'https://api.github.com/gists',
				headers: {
					Authorization: `Bearer ${session?.accessToken}`,
					accept: 'application/vnd.github+json'
				},
				data: {
					description: `FEENEMIES_PROJECT_${ts}_${project_name}`,
					public: true,
					files: {
						'project-info': {
							content: compressed_content
						}
					}
				}
			})
			const { data, status } = response
			return res.status(status).send({ status, message: 'success', data })
		} catch (error) {
			res.status(error.response.status ?? 500).send(error.response.data ?? error)
		}
	} else {
		res.status(405).send({ message: 'Method not allowed' })
	}
}

export default api
