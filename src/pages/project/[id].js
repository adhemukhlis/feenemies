import { Button, Divider, Form, Input, Select, Space, Tabs, Typography, Tree } from 'antd'
import axios from 'axios'
import { useEffect, useState, useCallback } from 'react'
import UrlParse from 'url-parse'
import { debounce, has, intersection, uniq } from 'lodash'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import Link from 'next/link'
import { getSession, useSession } from 'next-auth/react'
import lz from 'lz-string'
import { useRouter } from 'next/router'
import routeGuard from '@/utils/route-guard'
const pathRegex = /\/:\w+/g
const varRegex = /({\w+})/g
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
const METHOD_OPTIONS = METHODS.map((item) => ({ value: item, label: item }))
const { Text } = Typography
const Index = ({ data }) => {
	const { data: session } = useSession()
	const router = useRouter()
	const [form] = Form.useForm()
	const [bodyForm] = Form.useForm()
	const [queryForm] = Form.useForm()
	const [pathForm] = Form.useForm()
	const [varForm] = Form.useForm()
	const queryWatch = Form.useWatch('query', queryForm)
	const pathWatch = Form.useWatch('path', pathForm)
	const varWatch = Form.useWatch('var', varForm)
	const urlWatch = Form.useWatch('url', form)
	const generatedUrlWatch = Form.useWatch('generatedUrl', form)
	const [sendLoading, setSendLoading] = useState(false)
	const [urlValidation, setUrlValidation] = useState({})
	const [response, setResponse] = useState(undefined)
	function transformObject(inputObject) {


		const transformed = []

		// Recursive function to transform nodes
		function transformNode(node, keyPrefix, isArray = false) {

			const children = []
			const keyPrefixWithDot = keyPrefix ? `${keyPrefix}-` : ''
			;(isArray ? node : Object.keys(node)).forEach((key, index) => {
				const childNode = node[isArray ? index : key]

				// Add title and key
				const transformedNode = {
					title: isArray ? index : key,
					key: `${keyPrefixWithDot}${index}`
				}

				// Check if childNode has children
				if (Array.isArray(childNode)) {
					transformedNode.children =
						childNode !== null
							? transformNode(childNode, transformedNode.key, true)
							: [{ title: `${childNode}`, key: `${keyPrefixWithDot}${index}-0` }]
				} else if (typeof childNode === 'object') {
					transformedNode.children =
						childNode !== null
							? transformNode(childNode, transformedNode.key)
							: [{ title: `${childNode}`, key: `${keyPrefixWithDot}${index}-0` }]
				} else {
					transformedNode.children = [{ title: `${childNode}`, key: `${keyPrefixWithDot}${index}-0` }]
				}

				children.push(transformedNode)
			})

			return children
		}

		// Start the transformation with the root input object
		transformed.push({
			title: 'response',
			key: '0',
			children: !!inputObject ? transformNode(inputObject, '0') : []
		})

		return transformed
	}
	const handleSend = async (values) => {
		const { generatedUrl, method } = values
		const body = getBody()
		const parsedUrl = UrlParse(values.generatedUrl)
		const isLocalhost = parsedUrl.hostname === 'localhost'
		setSendLoading(true)
		return await axios
			.request({
				method: isLocalhost ? method : 'POST',
				url: isLocalhost ? generatedUrl : '/api/send',
				data: isLocalhost ? body : { url: generatedUrl, method, body }
			})
			.then((res) => {
				setResponse(res.data)
			})
			.finally(() => {
				setSendLoading(false)
			})
	}
	const getBody = () => {
		const body = bodyForm.getFieldValue('body') || []
		const bodyArrayToObject = (body || [])
			.filter((obj) => 'name' in (obj || {}))
			.reduce((obj, { name, value }) => {
				obj[name] = value
				return obj
			}, {})
		return bodyArrayToObject
	}
	const debounceSetUrl = useCallback(
		debounce(async (newUrl) => {
			form.setFieldValue('url', newUrl)
		}, 1000),
		[]
	)
	const debounceSetUrlGenerated = useCallback(
		debounce(async (newUrl, pathArray, varArray) => {
			let newUrlString = newUrl
			if (Array.isArray(pathArray)) {
				const pathArrayToObject = (pathArray || [])
					.filter((obj) => 'name' in (obj || {}))
					.reduce((obj, { name, value }) => {
						obj[`/:${name}`] = '/' + value
						return obj
					}, {})
				const outputString = newUrlString.replace(pathRegex, (match) => pathArrayToObject[match] || match)
				newUrlString = outputString
			}
			if (Array.isArray(varArray)) {
				const varArrayToObject = (varArray || [])
					.filter((obj) => 'name' in (obj || {}))
					.reduce((obj, { name, value }) => {
						obj[`{${name}}`] = value
						return obj
					}, {})
				const outputString = newUrlString.replace(varRegex, (match) => varArrayToObject[match] || match)
				newUrlString = outputString
			}
			form.setFieldValue('generatedUrl', newUrlString)
		}, 1000),
		[]
	)
	const debounceSetQuery = useCallback(
		debounce(async (value) => {
			queryForm.setFieldValue('query', value)
		}, 1000),
		[]
	)
	const debounceSetPathVariables = useCallback(
		debounce(async (value) => {
			const prev = pathForm.getFieldValue('path') || []
			const prevValue = prev.map(({ name }) => name)
			const currentValue = (value || []).map(({ name }) => name)
			const intersectionValue = intersection(prevValue, currentValue)
			const keepValue = prev.filter(({ name }) => intersectionValue.includes(name))
			const newValue = value.filter(({ name }) => !intersectionValue.includes(name))
			pathForm.setFieldValue('path', [...keepValue, ...newValue])
		}, 1000),
		[]
	)
	// const debounceSetVariables = useCallback(
	// 	debounce(async (value) => {
	// 		const prev = varForm.getFieldValue('var') || []
	// 		const prevValue = prev.map(({ name }) => name)
	// 		const currentValue = (value || []).map(({ name }) => name)
	// 		const intersectionValue = intersection(prevValue, currentValue)
	// 		const keepValue = prev.filter(({ name }) => intersectionValue.includes(name))
	// 		const newValue = value.filter(({ name }) => !intersectionValue.includes(name))
	// 		varForm.setFieldValue('var', [...keepValue, ...newValue])
	// 	}, 1000),
	// 	[]
	// )

	useEffect(() => {
		if (!!urlWatch) {
			const currentUrl = UrlParse(urlWatch, true)
			const urlQuery = currentUrl.query
			const pathCaptures = urlWatch.match(pathRegex)
			// const varCaptures = urlWatch.match(varRegex)
			if (Object.keys(urlQuery).length > 0) {
				const queryObjectToArray = Object.keys(urlQuery).map((key) => ({ name: key, value: urlQuery[key] }))
				debounceSetQuery(queryObjectToArray)
			}
			if (Array.isArray(pathCaptures)) {
				const pathVariablesToArray = uniq(pathCaptures).map((rawPath) => ({ name: rawPath.slice(2), value: '' }))
				debounceSetPathVariables(pathVariablesToArray)
			} else {
				debounceSetPathVariables([])
			}
			// if (Array.isArray(varCaptures)) {
			// 	console.log(uniq(varCaptures))
			// 	const variablesToArray = uniq(varCaptures).map((rawPath) => ({
			// 		name: rawPath.slice(1, rawPath.length - 1),
			// 		value: ''
			// 	}))
			// 	debounceSetVariables(variablesToArray)
			// } else {
			// 	debounceSetVariables([])
			// }
			debounceSetUrlGenerated(urlWatch, pathWatch || [], varWatch || [])
		}
	}, [urlWatch])
	useEffect(() => {
		if (Array.isArray(queryWatch) && !!urlWatch) {
			const queryArrayToObject = (queryWatch || [])
				.filter((obj) => 'name' in (obj || {}))
				.reduce((obj, { name, value }) => {
					obj[name] = value
					return obj
				}, {})
			const currentUrl = UrlParse(urlWatch, {})
			const newUrl = currentUrl.set('query', queryArrayToObject)
			const newUrlString = newUrl.toString()
			debounceSetUrl(newUrlString)
		}
	}, [queryWatch])
	useEffect(() => {
		if (Array.isArray(pathWatch) && !!urlWatch) {
			debounceSetUrlGenerated(urlWatch, pathWatch, varWatch || [])
		}
	}, [pathWatch])
	useEffect(() => {
		if (Array.isArray(varWatch) && !!urlWatch) {
			debounceSetUrlGenerated(urlWatch, pathWatch || [], varWatch)
		}
	}, [varWatch])
	useEffect(() => {
		if (!!generatedUrlWatch) {
			const urlValidation =
				UrlParse(generatedUrlWatch, true).hostname === 'localhost'
					? {
							validateStatus: 'warning',
							help: (
								<>
									{'Looks like you are trying to access localhost, make sure to set CORS "Access-Control-Allow-Origin" to "*" '}
									<Link href={'https://gist.github.com/adhemukhlis/12b40ae3144d27aad35beeee6f86e160'}>detail</Link>
								</>
							)
					  }
					: {}
			setUrlValidation(urlValidation)
		} else {
			setUrlValidation({})
		}
	}, [generatedUrlWatch])
	const items = [
		{
			key: '1',
			label: `Query Params`,
			forceRender: true,
			children: (
				<Form form={queryForm} layout="vertical">
					<Form.List name="query">
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
										<Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: 'Missing name' }]}>
											<Input placeholder="Name" />
										</Form.Item>
										<Form.Item {...restField} name={[name, 'value']} rules={[{ required: true, message: 'Missing value' }]}>
											<Input placeholder="Value" />
										</Form.Item>
										<MinusCircleOutlined onClick={() => remove(name)} />
									</Space>
								))}
								<Form.Item>
									<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
										Add
									</Button>
								</Form.Item>
							</>
						)}
					</Form.List>
				</Form>
			)
		},
		{
			key: '2',
			label: `Path Variables`,
			forceRender: true,
			children: (
				<Form form={pathForm} layout="vertical" initialValues={{ path: [{ name: 'id', value: router.query.id }] }}>
					<Form.List name="path">
						{(fields, { remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
										<Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: 'Missing name' }]}>
											<Input placeholder="Name" disabled />
										</Form.Item>
										<Form.Item {...restField} name={[name, 'value']} rules={[{ required: true, message: 'Missing value' }]}>
											<Input placeholder="Value" />
										</Form.Item>
									</Space>
								))}
							</>
						)}
					</Form.List>
				</Form>
			)
		},
		{
			key: '3',
			label: `Body`,
			forceRender: true,
			children: (
				<Form form={bodyForm} layout="vertical">
					<Form.List name="body">
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
										<Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: 'Missing name' }]}>
											<Input placeholder="Name" />
										</Form.Item>
										<Form.Item {...restField} name={[name, 'value']} rules={[{ required: true, message: 'Missing value' }]}>
											<Input placeholder="Value" />
										</Form.Item>
										<MinusCircleOutlined onClick={() => remove(name)} />
									</Space>
								))}
								<Form.Item>
									<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
										Add
									</Button>
								</Form.Item>
							</>
						)}
					</Form.List>
				</Form>
			)
		},
		{
			key: '4',
			label: `Variables`,
			forceRender: true,
			children: (
				<Form form={varForm} layout="vertical">
					<Form.List name="var">
						{(fields, { add, remove }) => (
							<>
								{fields.map(({ key, name, ...restField }) => (
									<Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
										<Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: 'Missing name' }]}>
											<Input placeholder="Name" />
										</Form.Item>
										<Form.Item {...restField} name={[name, 'value']} rules={[{ required: true, message: 'Missing value' }]}>
											<Input placeholder="Value" />
										</Form.Item>
										<MinusCircleOutlined onClick={() => remove(name)} />
									</Space>
								))}
								<Form.Item>
									<Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
										Add
									</Button>
								</Form.Item>
							</>
						)}
					</Form.List>
				</Form>
			)
		}
	]

	return (
		<div style={{ minHeight: '100vh', padding: '2rem' }}>
			<Text strong>{data.project_name}</Text>
			<Form
				layout={'inline'}
				form={form}
				onFinish={handleSend}
				style={{ maxWidth: 'none' }}
				initialValues={{ method: 'GET', url: 'https://api.github.com/gists/:id', generatedUrl: '' }}
				autoComplete="none">
				<Form.Item name="method" style={{ width: '6rem' }}>
					<Select options={METHOD_OPTIONS} style={{ width: '100%' }} />
				</Form.Item>
				<Form.Item name="url" style={{ flex: 1 }} hasFeedback {...urlValidation}>
					<Input />
				</Form.Item>
				<Form.Item name="generatedUrl" hidden />
				<Form.Item>
					<Button block type="primary" htmlType="submit" loading={sendLoading}>
						Send
					</Button>
				</Form.Item>
			</Form>
			<Divider />
			<Input addonBefore="preview" value={generatedUrlWatch} readOnly />
			<Divider />
			<Tabs defaultActiveKey="1" items={items} />
			<Divider />
			<Tree
				showLine
				// switcherIcon={<DownOutlined />}
				defaultExpandAll
				// onSelect={onSelect}
				treeData={transformObject(response)}
			/>
		</div>
	)
}
export default Index
export const getServerSideProps = async (context) => {
	const session = await getSession(context)
	const accessToken = session?.accessToken
	const isLoggedIn = !!accessToken
	let data = {}
	if (has(session, 'accessToken') && session?.provider === 'github') {
		const res = await axios.request({
			method: 'GET',
			url: 'https://api.github.com/gists/' + context.params.id,
			headers: {
				Authorization: `Bearer ${session?.accessToken}`,
				Accept: 'application/vnd.github+json'
			}
		})
		const compressed_content = res.data.files['project-info'].content
		const decompressed_content = lz.decompress(compressed_content)
		data = JSON.parse(decompressed_content)
	}

	return routeGuard([isLoggedIn], '/', {
		props: {
			data
		}
	})
}
