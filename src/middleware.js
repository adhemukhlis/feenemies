import { NextResponse } from 'next/server'
import { getIronSession } from 'iron-session/edge'
import sessionOptions from '@/utils/sessionOptions'
const isAuthenticated = () => true
// This function can be marked `async` if using `await` inside
const middleware = async (request) => {
	const nextRes = NextResponse.next()
	const session = await getIronSession(request, nextRes, sessionOptions)

	// Call our authentication function to check the request
	if (!isAuthenticated(request)) {
		// Respond with JSON indicating an error message
		return new NextResponse(JSON.stringify({ success: false, message: 'authentication failed' }), {
			status: 401,
			headers: { 'content-type': 'application/json' }
		})
	}
}
export default middleware
export const config = {
	matcher: '/api/:function*'
}
