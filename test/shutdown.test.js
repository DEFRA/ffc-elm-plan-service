describe('shutdown', () => {
  const shutdown = require('../server/shutdown')
  const messageService = require('../server/services/message-service')

  jest.mock('../server/services/message-service')

  beforeEach(() => {
    jest.spyOn(console, 'info').mockImplementation()
    jest.spyOn(messageService, 'closeConnections').mockImplementation()
    jest.spyOn(process, 'exit').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('logs the reason for shutdown', async () => {
    await shutdown('received SIGINT.')
    expect(console.info).toHaveBeenCalledWith('Shutting down. Reason: received SIGINT.')
  })

  test('closes message service connections', async () => {
    await shutdown()
    expect(messageService.closeConnections).toHaveBeenCalled()
  })

  test('exits with code 0', async () => {
    await shutdown()
    expect(process.exit).toHaveBeenCalledWith(0)
  })
})
