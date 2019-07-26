const sha1 = require('../shared-utils/sha1')
const BASE_URL = ''
const HASH_PREFIX_SIZE = 4

class HTTPSService {
    constructor () {
        this._cache = new Map()
        this._activeRequests = new Map()
    }

    _cacheResponse (query, response) {
        // TODO add TTL
        this._cache.set(query, response)
    }

    /**
     * @param {string} host
     * @returns {Boolean|null} 
     */
    checkInCache (host) {
        const hash = sha1(host)
        const query = hash.substr(0, HASH_PREFIX_SIZE)
        const result = this._cache.get(query)

        if (result) {
            return result.includes(hash)
        }

        return null
    }

    /**
     * @param {string} host
     * @returns {Promise<Boolean>}
     */
    checkInService (host) {
        const hash = sha1(host)
        const query = hash.substring(0, HASH_PREFIX_SIZE)

        if (this._activeRequests.has(query)) {
            console.info(`Request for ${host} is already in progress.`)
            return this._activeRequests.get(query)
        }

        console.info(`Requesting info for ${host}.`)

        const queryUrl = new URL(BASE_URL)
        queryUrl.searchParams.append('pv1', query)

        const request = fetch(queryUrl.toString())
            .then(response => {
                this._activeRequests.delete(query)
                return response.json()
            })
            .then(data => {
                this._cacheResponse(query, data)
                return data.includes(hash)
            })
            .catch(e => {
                this._activeRequests.delete(query)
                console.error('Failed contacting service: ' + e.message)
                throw e
            })

        this._activeRequests.set(query, request)

        // TODO handle failures gracefully
    }
}

module.exports = new HTTPSService()
