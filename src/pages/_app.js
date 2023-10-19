import '@/styles/globals.css'
import React from 'react'
import { StyleProvider } from '@ant-design/cssinjs'
import { ConfigProvider } from 'antd'
import { SessionProvider } from 'next-auth/react'

// import axios from 'axios'
// import { getIronSession } from 'iron-session'
// import { has } from 'lodash'
// import sessionOptions from '@/utils/sessionOptions'
// import globalStore from '@/utils/global-store'
// require('@/utils/mock-adapter')
if (!process.browser) React.useLayoutEffect = React.useEffect
const App = ({ Component, pageProps: { session, ...pageProps } }) => {
	return (
		<SessionProvider session={session} refetchInterval={5 * 60}>
			<StyleProvider hashPriority="high">
				<ConfigProvider
					theme={{
						token: {
							fontFamily: 'verdana'
						}
					}}>
					<Component {...pageProps} />
				</ConfigProvider>
			</StyleProvider>
		</SessionProvider>
	)
}

// App.getInitialProps = async ({ Component, ctx }) => {
// 	let session = {}
// 	let url = {}
// 	try {
// 		session = await getIronSession(ctx.req, ctx.res, sessionOptions)
// 		const nextRequestMeta = ctx.req[Reflect.ownKeys(ctx.req).find((s) => String(s) === 'Symbol(NextRequestMeta)')]
// 		url = new URL(nextRequestMeta.__NEXT_INIT_URL)
// 	} catch (error) {
// 		//
// 	}
// 	if (has(session, 'auth.role.role_id')) {
// 		await axios
// 			.request({
// 				method: 'get',
// 				baseURL: url?.origin,
// 				headers: ctx.req ? { cookie: ctx.req.headers.cookie } : undefined,
// 				url: '/api/auth/get-menu-permissions/' + session.auth.role.role_id
// 			})
// 			.then((res) => {
// 				globalStore.set('authMenu', res.data.data.permission)
// 			})
// 	}
// 	let pageProps = {}
// 	if (Component.getInitialProps) {
// 		pageProps = await Component.getInitialProps(ctx)
// 	}
// 	return { pageProps }
// }

export default App
