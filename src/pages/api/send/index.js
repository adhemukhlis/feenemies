import axios from 'axios'
import { withSessionRoute } from '@/utils/session-wrapper'

export default withSessionRoute(async (req, res) => {
	const { method, url, body } = req.body
	if (req.method === 'POST') {
		try {
			const response = await axios.request({
				method,
				url,
				data: body
			})
			console.log('res', Object.keys(response.request))
			const { data, status, config, headers, ...other } = response
			res.status(200).send({ data, status, config, headers })
		} catch (error) {
			res.status(error.response.status ?? 500).send(error.response.data ?? error)
		}
	} else {
		res.status(405).send({ message: 'Method not allowed' })
	}
})
