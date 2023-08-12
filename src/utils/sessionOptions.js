const sessionOptions = {
	cookieName: process.env.SESSION_COOKIE_NAME,
	password: process.env.SESSION_KEY,
	// secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
	cookieOptions: {
		secure: process.env.NODE_ENV === 'production',
		httpOnly: process.env.NODE_ENV === 'production',
		sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
		// maxAge : in seconds
		maxAge: 604800
	}
}
export default sessionOptions
