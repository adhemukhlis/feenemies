const asyncLocalStorage = {
	async setItem(key, value) {
		await null
		return localStorage.setItem(key, value)
	},
	async getItem(key) {
		await null
		return localStorage.getItem(key)
	}
}
export default asyncLocalStorage
