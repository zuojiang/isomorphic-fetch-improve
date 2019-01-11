const http = require('http')
const URL = require('url')
const serve = require('serve-handler')
const fetch = require('./index.js')

const server = http.createServer((req, res) => {
  const {pathname} = URL.parse(req.url)
  if (/\w+\.\w+/g.test(pathname)) {
    serve(req, res, {
      cleanUrls: false,
    })
    return
  }
  switch (pathname) {
    case '/delay':
      setTimeout(() => {
        res.end(new Date().toString())
      }, 5000)
      break
    case '/error':
      res.writeHead(500)
      res.end()
      break
    default:
      res.writeHead(404)
      res.end()
  }
})
server.listen(3000)

const baseUrl = 'http://127.0.0.1:3000'

describe('timeout', function () {
  this.timeout(10000)

  it('3s', (done) => {
    fetch(baseUrl+'/delay', {
      timeout: 3000,
    }).then(res => {
      done(new Error(''))
    }, err => {
      done()
    })
  })

  it('7s', (done) => {
    fetch(baseUrl+'/delay', {
      timeout: 7000,
    }).then(res => {
      done()
    }, done)
  })

  it('0s', (done) => {
    fetch(baseUrl+'/delay', {
      timeout: 0,
    }).then(res => {
      done()
    }, done)
  })

})

describe('retry', function(){
  this.timeout(10000)

  it('http://127.0.0.1:21', (done) => {
    const retryDelay = 1000
    const retryMaxCount = 3
    const start = Date.now()
    fetch('http://127.0.0.1:21/', {
      retryDelay,
      retryMaxCount,
    }).then(res => {
      done('error')
    }, err => {
      if (Date.now() - start >= retryDelay * retryMaxCount) {
        done()
      } else {
        done(err)
      }
    })
  })

  it(baseUrl, (done) => {
    fetch(baseUrl+'/error', {
      retryMaxCount: 3
    }).then(res => {
      done()
    }, done)
  })
})

describe('cancelableTaskName', function(){
  this.timeout(10000)

  it('same task', (done) => {
    fetch(baseUrl+'/delay', {
      cancelableTaskName: 'task1'
    }).then(res => {
      done('error')
    }, err => {
      done()
    })

    fetch(baseUrl+'/error', {
      cancelableTaskName: 'task1'
    })
  })

  it('different task', (done) => {
    fetch(baseUrl+'/delay', {
      cancelableTaskName: 'task1'
    }).then(res => {
      done()
    }, err => {
      done('error')
    })

    fetch(baseUrl+'/error', {
      cancelableTaskName: 'task2'
    })
  })

})
