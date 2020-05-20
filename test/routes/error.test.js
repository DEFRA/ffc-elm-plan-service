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

  test('GET /error route returns 500', async () => {
    const options = {
      method: 'GET',
      url: '/error'
    }

    const response = await server.inject(options)
    expect(response.statusCode).toBe(500)
  })
})
