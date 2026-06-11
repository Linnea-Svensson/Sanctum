import configuration from '@feathersjs/configuration'
import { feathers } from '@feathersjs/feathers'
import {
  bodyParser,
  cors,
  errorHandler,
  koa,
  parseAuthentication,
  rest
} from '@feathersjs/koa'

import type { Application } from './declarations.js'
import { knexClient } from './knex.js'
import { authentication } from './authentication.js'
import { services } from './services/index.js'

const app: Application = koa(feathers())

// Load config from config/*.json + environment variables.
app.configure(configuration())

// Global middleware.
app.use(cors())
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

// Transports.
app.configure(rest())

// Persistence, auth and services.
app.configure(knexClient)
app.configure(authentication)
app.configure(services)

export { app }
