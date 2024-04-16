const { default: axios } = require('axios')

const createDoc = async ({ accessToken }) => {
	axios.request({
		method: 'POST',
		url: 'https://content-docs.googleapis.com/v1/documents?alt=json&key=AIzaSyBt6YWTdEhulMbRLRm7wHbLT84m4N1iHHk',
		headers: {
			Authorization: `Bearer ${accessToken}`
		},
		data: {
			title: 'feenemies document'
		}
	})
}
export default createDoc
