const fetch = require('isomorphic-fetch')
const { Base64 } = require('js-base64')

const taskMap = new Map()

module.exports = function _fetch (url, options = {}) {
  const {
    timeout = 0,
    retryDelay = 0,
    retryMaxCount = Infinity,
    cancelableTaskName = null,
    auth = null,
    forceMethod = null,
    headers = {},
    method = 'GET',
    ...others
  } = options
  const list = []
  let timer = null

  if (cancelableTaskName) {
    if (taskMap.has(cancelableTaskName)) {
      taskMap.get(cancelableTaskName)(new Error('cancel'))
    }
    if (url) {
      list.push(new Promise((resolve, reject) => {
        taskMap.set(cancelableTaskName, reject)
      }))
    }
  }

  if (url) {

    if (auth) {
      const code = Base64.encode(`${auth.user || ''}:${auth.password || ''}`)
      headers.authorization = `Basic ${code}`
      delete headers.Authorization
    }

    list.push(fetch(url, {
      ...others,
      method: forceMethod || method.toUpperCase(),
      headers,
    }).then(res => {
      if (cancelableTaskName) {
        taskMap.delete(cancelableTaskName)
      }
      return res
    }, err => {
      if (cancelableTaskName) {
        taskMap.delete(cancelableTaskName)
      }
      if (retryMaxCount > 0) {
        return delay(retryDelay).then(() => _fetch(url, {
          ...options,
          retryMaxCount: Number.isFinite(retryMaxCount)
            ? retryMaxCount-1 : retryMaxCount
        }))
      }
      throw err
    }))
  }

  if (timeout > 0) {
    list.push(new Promise((resolve, reject) => {
      timer = setTimeout(() => {
        reject(new Error('timeout'))
      }, timeout)
    }))
  }

  return Promise.race(list).then(v => {
    clearTimeout(timer)
    return v
  }, e => {
    clearTimeout(timer)
    throw e
  })
}

function delay (timeout) {
  return new Promise(resolve => {
    setTimeout(resolve, timeout)
  })
}
