import Document, { Head, Html, Main, NextScript } from 'next/document'
import { StyleProvider, createCache, extractStyle } from '@ant-design/cssinjs'
import getConfig from 'next/config'
const { publicRuntimeConfig } = getConfig()
export default class MyDocument extends Document {
	static async getInitialProps(ctx) {
		const cache = createCache()
		const originalRenderPage = ctx.renderPage
		ctx.renderPage = () =>
			originalRenderPage({
				enhanceApp: (App) => (props) => (
					<StyleProvider cache={cache}>
						<App {...props} />
					</StyleProvider>
				)
			})

		const initialProps = await Document.getInitialProps(ctx)
		return {
			...initialProps,
			styles: (
				<>
					{initialProps.styles}
					{/* This is hack, `extractStyle` does not currently support returning JSX or related data. */}
					<script
						dangerouslySetInnerHTML={{
							__html: `</script>${extractStyle(cache)}<script>`
						}}
					/>
				</>
			)
		}
	}

	render() {
		return (
			<Html>
				<Head>
					<title>{publicRuntimeConfig.AppName}</title>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		)
	}
}
