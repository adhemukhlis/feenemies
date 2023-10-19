const routeGuard = (allowed, redirectTo, props) => {
	const _allowed = !allowed.includes(false)
	return !_allowed
		? {
				redirect: {
					destination: redirectTo,
					permanent: false
				}
		  }
		: props
}
export default routeGuard
