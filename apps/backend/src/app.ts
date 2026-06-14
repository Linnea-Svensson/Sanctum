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
// Lock CORS to the origins listed in config (`origins`). If none are configured
// we fall back to reflecting the request origin (handy in local dev).
const allowedOrigins = (app.get('origins') as string[] | undefined) ?? []
app.use(
  cors({
    origin(ctx) {
      const requestOrigin = ctx.get('Origin')
      if (allowedOrigins.length === 0) return requestOrigin || '*'
      return allowedOrigins.includes(requestOrigin) ? requestOrigin : ''
    }
  })
)
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
