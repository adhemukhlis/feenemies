import { withIronSessionApiRoute, withIronSessionSsr } from 'iron-session/next'
import sessionOptions from './sessionOptions'

export function withSessionRoute(handler) {
	return withIronSessionApiRoute(handler, sessionOptions)
}

export function withSession(handler) {
	return withIronSessionSsr(handler, sessionOptions)
}
