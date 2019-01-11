isomorphic-fetch-improve
===

Improvements over [isomorphic-fetch](https://github.com/matthew-andrews/isomorphic-fetch).

Installation
---

```sh
npm i isomorphic-fetch-improve -S
```

Usage
---
```js
const fetch = require('isomorphic-fetch-improve')
const url = 'http://localhost:3000/test'

fetch(url, {
  timeout: 1000 * 30, // 30s
  retryDelay: 1000, // 1s
  retryMaxCount: 10,  // total 11 times request
  cancelableTaskName: 'task1',
}).catch(err => {
  if (err.message == 'timeout') {
    // Request timeout
  } else if (err.message == 'cancel') {
    // This request was cancelled due to there is a new request
  } else {
    // Other
  }
})

// Send a request by the same task name again
fetch(url || null, {
  cancelableTaskName: 'task1',
})
```

Options
---

1. `timeout` [Default: `0`] Set timeout.

1. `retryMaxCount` [Default: `Infinity`] Set retry max count, when an error occurred, such as refresh, lock screen.

1. `cancelableTaskName` [Default: `null`] Set the task name, to avoid the response data is replaced by old request.

License
---

MIT
