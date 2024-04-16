import '@/styles/globals.css'
import { StyleProvider } from '@ant-design/cssinjs'
import { ConfigProvider } from 'antd'
import { useRouter } from 'next/router'
import { SessionProvider } from 'next-auth/react'
import React from 'react'
import LayoutComponent from '@/components/Layout'
import PUBLIC_PAGE_URL from '@/configs/public-page-url'

if (!process.browser) React.useLayoutEffect = React.useEffect

const EntryPoint = ({ Component, pageProps: { session, ...pageProps } }) => {
	const router = useRouter()
	return (
		<SessionProvider session={session}>
			<StyleProvider hashPriority="high">
				<ConfigProvider
					theme={{
						token: {
							fontFamily: 'verdana'
						}
					}}>
					{PUBLIC_PAGE_URL.includes(router.pathname) ? (
						<div
							style={{
								minHeight: '100vh', // minHeight = heigh of screen - (margin top + margin bottom)
								display: 'flex',
								justifyContent: 'center'
							}}>
							<Component {...pageProps} />
						</div>
					) : (
						<LayoutComponent>
							<Component {...pageProps} />
						</LayoutComponent>
					)}
				</ConfigProvider>
			</StyleProvider>
		</SessionProvider>
	)
}

export default EntryPoint
