import 'dotenv/config'
import { app } from './app.js'
import { ensureSchema } from './knex.js'
import { logger } from './logger.js'

const port = app.get('port')
const host = app.get('host')

process.on('unhandledRejection', (reason) =>
  logger.error('Unhandled Rejection %O', reason)
)

ensureSchema(app.get('sqliteClient'))
  .then(() => app.listen(port))
  .then(() => logger.info(`Sanctum API listening on http://${host}:${port}`))
  .catch((error) => {
    logger.error(error)
    process.exit(1)
  })
