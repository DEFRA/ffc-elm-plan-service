describe('createServer', () => {
  const createServer = require('../server')
  const messageService = require('../server/services/message-service')
  const shutdown = require('../server/shutdown')

  jest.mock('../server/repository/plan-repository')
  jest.mock('../server/services/message-service')
  jest.mock('../server/shutdown')

  beforeEach(async () => {
    jest.spyOn(messageService, 'createQueuesIfRequired').mockImplementation()
    jest.spyOn(process, 'on')
    shutdown.mockImplementation()
  })

  afterEach(async () => {
    jest.restoreAllMocks()

    // Don't call the application stop handler when test execution is exited
    process.removeAllListeners('SIGINT')
    process.removeAllListeners('SIGTERM')
  })

  test('returns a server', async (done) => {
    const server = await createServer()
    expect(server).toBeDefined()
    done()
  })

  test('sets up graceful shutdown for SIGINT and SIGTERM signals', async () => {
    process.on.mockImplementation(async (signal, callback) => {
      // Check the signal handler being registered is for an expected signal
      expect(signal).toMatch(/^(SIGINT|SIGTERM)$/)
      expect(typeof callback).toBe('function')

      // Check the provided callback triggers a graceful shutdown correctly
      callback()
      expect(shutdown).toHaveBeenCalledWith(`received ${signal}.`)
    })

    await createServer()

    // Ensure signal handlers were created for both SIGINT and SIGTERM
    expect(process.on).toHaveBeenCalledWith('SIGINT', expect.anything())
    expect(process.on).toHaveBeenCalledWith('SIGTERM', expect.anything())
  })

  test('creates message queues', async (done) => {
    await createServer()
    expect(messageService.createQueuesIfRequired).toHaveBeenCalled()
    done()
  })
})
