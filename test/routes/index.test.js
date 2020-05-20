describe('Web test', () => {
  const createServer = require('../../server')

  let server

  beforeEach(async () => {
    server = await createServer()
    await server.initialize()
  })

  afterEach(async () => {
    await server.stop()
  })

  afterAll(async () => {
    jest.unmock('../../server/repository/plan-repository')
    jest.unmock('../../server/services/message-service')
  })

  test('GET / route returns 404', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(404)
    expect((response.headers['content-type'])).toEqual(expect.stringContaining('application/json'))
  })

  test('GET / route returns 404 for dev mode', async () => {
    const options = {
      method: 'GET',
      url: '/'
    }
    jest.mock('../../server/config', () => {
      return {
        isDev: true,
        port: 80
      }
    })

    const response = await server.inject(options)
    expect(response.statusCode).toBe(404)
    expect((response.headers['content-type'])).toEqual(expect.stringContaining('application/json'))
    jest.unmock('../../server/config')
  })
})
