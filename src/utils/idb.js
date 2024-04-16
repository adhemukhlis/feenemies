const db_name = 'feenemies_db'
let request
let db
let version = 1

const stores = {
	projects: {
		keyPath: 'id'
	}
}

export const initDB = () => {
	return new Promise((resolve) => {
		request = indexedDB.open(db_name)

		request.onupgradeneeded = () => {
			db = request.result
			Object.keys(stores).forEach((store) => {
				if (!db.objectStoreNames.contains(store)) {
					db.createObjectStore(store, { keyPath: stores[store].keyPath })
				}
			})
		}

		request.onsuccess = () => {
			db = request.result
			version = db.version
			console.log('request.onsuccess - initDB', version)
			resolve(true)
		}

		request.onerror = () => {
			resolve(false)
		}
	})
}

export const addData = (storeName, data) => {
	return new Promise((resolve) => {
		request = indexedDB.open(db_name, version)

		request.onsuccess = () => {
			console.log('request.onsuccess - addData', data)
			db = request.result
			const tx = db.transaction(storeName, 'readwrite')
			const store = tx.objectStore(storeName)
			store.add(data)
			resolve(data)
		}

		request.onerror = () => {
			const error = request.error?.message
			if (error) {
				resolve(error)
			} else {
				resolve('Unknown error')
			}
		}
	})
}
export const getStoreData = (storeName) => {
	return new Promise((resolve) => {
		request = indexedDB.open(db_name)

		request.onsuccess = () => {
			console.log('request.onsuccess - getAllData')
			db = request.result
			const tx = db.transaction(storeName, 'readonly')
			const store = tx.objectStore(storeName)
			const res = store.getAll()
			res.onsuccess = () => {
				resolve(res.result)
			}
		}
	})
}
export const getDataByKey = (storeName, key) => {
	return new Promise((resolve) => {
		// again open the connection
		request = indexedDB.open(db_name, version)

		request.onsuccess = () => {
			console.log('request.onsuccess - deleteData', key)
			db = request.result
			const tx = db.transaction(storeName, 'readwrite')
			const store = tx.objectStore(storeName)
			const res = store.get(key)

			// add listeners that will resolve the Promise
			res.onsuccess = () => {
				resolve(true)
			}
			res.onerror = () => {
				resolve(false)
			}
		}
	})
}
export const deleteData = (storeName, key) => {
	return new Promise((resolve) => {
		// again open the connection
		request = indexedDB.open(db_name, version)

		request.onsuccess = () => {
			console.log('request.onsuccess - deleteData', key)
			db = request.result
			const tx = db.transaction(storeName, 'readwrite')
			const store = tx.objectStore(storeName)
			const res = store.delete(key)

			// add listeners that will resolve the Promise
			res.onsuccess = () => {
				resolve(true)
			}
			res.onerror = () => {
				resolve(false)
			}
		}
	})
}
