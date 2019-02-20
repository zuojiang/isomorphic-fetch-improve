const fetch = require('./index.js')
const users = require('./users')

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
    fetch(baseUrl+'/ok', {
      cancelableTaskName: 'task1'
    })
  })

  it('different task', (done) => {
    fetch(baseUrl+'/delay', {
      cancelableTaskName: 'task2'
    }).then(res => {
      done()
    }, err => {
      done('error')
    })

    fetch(baseUrl+'/ok', {
      cancelableTaskName: 'task3'
    })
  })
})

describe('auth', function(){

  it('exist', (done) => {
    fetch(baseUrl+'/auth', {
      auth: {
        user: 'admin',
        password: users.admin,
      },
    }).then(res => {
      if (res.status == 200) {
        done()
      } else {
        done(res.statusText)
      }
    })
  })

  it('not exist', (done) => {
    fetch(baseUrl+'/auth', {
      auth: {
        user: 'test',
        password: '123',
      },
    }).then(res => {
      if (res.status == 401) {
        done()
      } else {
        done(res.statusText)
      }
    })
  })

  it('no password', (done) => {
    fetch(baseUrl+'/auth', {
      auth: {
        user: 'guest',
      },
    }).then(res => {
      if (res.status == 200) {
        done()
      } else {
        done(res.statusText)
      }
    })
  })


})


describe('forceMethod', function(){

  it('availability', (done) => {
    fetch(baseUrl+'/ok', {
      forceMethod: 'POST',
      auth: {
        user: 'admin',
        password: users.admin,
      },
    }).then(res => {
      if (res.status == 404) {
        done()
      } else {
        done(res.statusText)
      }
    })
  })

})
