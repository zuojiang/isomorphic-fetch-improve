const fetch = require('isomorphic-fetch')

const taskMap = new Map()

module.exports = function _fetch (url, options) {
  const {
    timeout = 0,
    retryMaxCount = Infinity,
    cancelableTaskName = null,
    ...others
  } = options
  const list = []

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
    list.push(fetch(url, others).then(res => {
      if (cancelableTaskName) {
        taskMap.delete(cancelableTaskName)
      }
      return res
    }, err => {
      if (cancelableTaskName) {
        taskMap.delete(cancelableTaskName)
      }
      if (retryMaxCount > 0) {
        return _fetch(url, {
          ...options,
          retryMaxCount: Number.isFinite(retryMaxCount)
            ? retryMaxCount-1 : retryMaxCount
        })
      }
      throw err
    }))
  }

  if (timeout > 0) {
    list.push(new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('timeout'))
      }, timeout)
    }))
  }

  return Promise.race(list)
}
