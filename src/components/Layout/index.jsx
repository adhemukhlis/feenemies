import { Dropdown, Layout, Menu, theme, message, Avatar, Typography, Divider, Button } from 'antd'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/react'
import { useState, useEffect, cloneElement } from 'react'
import { IconThinArrowRightFromBracket } from '@/components/icons'
import menus from '@/configs/menu'

import asyncLocalStorage from '@/utils/async-local-storage'

const { Content, Sider, Header } = Layout
const { Text } = Typography
const LayoutComponent = ({ children }) => {
	const session = useSession()
	const [messageApi, contextHolder] = message.useMessage()
	const [collapsed, setCollapsed] = useState(true)
	const router = useRouter()
	const {
		token: { colorBgContainer, colorBgElevated, borderRadiusLG, boxShadowSecondary }
	} = theme.useToken()
	const contentStyle = {
		backgroundColor: colorBgElevated,
		borderRadius: borderRadiusLG,
		boxShadow: boxShadowSecondary,
		width: '20rem'
	}

	const currentPath = router.pathname

	const handleSelectMenu = (menu) => {
		if ('key' in menu && !!menu?.key) {
			router.push(menu.key)
		}
	}
	const handleLogOut = async () => {
		messageApi.open({
			key: 'logout',
			type: 'loading',
			content: 'Logging Out..'
		})
		signOut()
	}
	const handleGoToProfile = () => {
		router.push('/profile')
	}
	const collapsedHandler = (value) => {
		setCollapsed(value)
		asyncLocalStorage.setItem('_sc', value)
	}
	const items = [
		{
			key: 'logout',
			label: 'Logout',
			icon: <IconThinArrowRightFromBracket />,
			onClick: handleLogOut
		}
	]
	useEffect(() => {
		asyncLocalStorage.getItem('_sc').then((res) => {
			setCollapsed(JSON.parse(res ?? 'true'))
		})
	}, [])
	return (
		<>
			<Layout
				style={{
					minHeight: '100vh'
				}}
				hasSider>
				<Sider
					collapsible
					width={250}
					style={{
						backgroundColor: colorBgContainer
					}}
					collapsed={collapsed}
					onCollapse={collapsedHandler}>
					<div
						style={{
							height: collapsed ? 100 : 40,
							margin: 16,
							background: colorBgContainer,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center'
						}}>
						<Image
							src="/_assets/images/logo.png"
							width={40}
							height={40}
							alt="logo"
							{...(collapsed
								? {
										style: {
											transform: 'rotate(-90deg)',
											transition: 'transform 0.2s ease'
										}
								  }
								: {
										style: {
											transform: 'rotate(0deg)',
											transition: 'transform 0.2s ease'
										}
								  })}
						/>
					</div>
					<Menu theme="light" defaultSelectedKeys={[currentPath]} mode="inline" items={menus} onSelect={handleSelectMenu} />
				</Sider>
				<Layout>
					<Header style={{ padding: '1rem', background: colorBgContainer, display: 'flex', justifyContent: 'flex-end' }}>
						<Dropdown
							menu={{ items }}
							placement="bottomRight"
							arrow
							trigger={['click']}
							dropdownRender={(menu) => (
								<div style={contentStyle}>
									<div
										style={{
											padding: '1rem',
											display: 'flex',
											flexDirection: 'column',
											gap: '0.4rem',
											alignItems: 'center'
										}}>
										<Avatar
											style={{ width: '4rem', aspectRatio: '1 / 1', height: 'fit-content' }}
											src={session?.data?.user?.image || `https://ui-avatars.com/api/?name=${session?.data?.user?.username}`}
										/>
										<Text>{session?.data?.user?.name}</Text>
										<Text type="secondary">{session?.data?.user?.username}</Text>
										<Button onClick={handleGoToProfile}>View Profile</Button>
									</div>
									<Divider
										style={{
											margin: 0
										}}
									/>
									{cloneElement(menu, {
										style: {
											boxShadow: 'none'
										}
									})}
								</div>
							)}>
							<Avatar
								size="large"
								style={{ cursor: 'pointer' }}
								src={session?.data?.user?.image || `https://ui-avatars.com/api/?name=${session?.data?.user?.username}`}
							/>
						</Dropdown>
					</Header>
					<Content
						style={{
							margin: '1rem',
							minHeight: 'calc(100vh-2rem)' // minHeight = heigh of screen - (margin top + margin bottom)
						}}>
						<div
							style={{
								padding: 24,
								height: '100%',
								background: colorBgContainer
							}}>
							{children}
						</div>
					</Content>
				</Layout>
			</Layout>
			{contextHolder}
		</>
	)
}
export default LayoutComponent
