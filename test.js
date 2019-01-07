const http = require('http')
const fetch = require('./index.js')

const server = http.createServer((req, res) => {
  // console.log(req.url);
  switch (req.url) {
    case '/delay':
      setTimeout(() => {
        res.end()
      }, 5000)
      break
    case '/error':
      res.writeHead(500)
      res.end()
      break
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

describe('retryMaxCount', function(){
  this.timeout(10000)

  it('http://127.0.0.1:1000', (done) => {
    fetch('http://127.0.0.1:1000/', {
      retryMaxCount: 3
    }).then(res => {
      done('error')
    }, err => {
      done()
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
