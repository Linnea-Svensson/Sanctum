import { authenticate } from '@feathersjs/authentication'
import { Forbidden } from '@feathersjs/errors'
import type { Application, HookContext } from '../../declarations.js'
import {
  OpeningHourService,
  getOptions,
  type OpeningHourPatch
} from './opening-hours.class.js'

declare module '../../declarations.js' {
  interface ServiceTypes {
    'opening-hours': OpeningHourService
  }
}

type OpeningHourContext = HookContext<OpeningHourService>

// Only signed-in admins may change opening hours.
const requireAdmin = async (context: OpeningHourContext): Promise<OpeningHourContext> => {
  const { user } = context.params as { user?: { isAdmin?: boolean | number } }
  if (!user?.isAdmin) {
    throw new Forbidden('Endast administratörer får ändra öppettider.')
  }
  return context
}

// Keep the time fields consistent: a closed day has no hours, and an open day
// must keep its hours. Prevents half-updated rows from reaching the database.
const normalizeHours = async (context: OpeningHourContext): Promise<OpeningHourContext> => {
  const data = context.data as OpeningHourPatch
  if (data.closed) {
    data.opens = null
    data.closes = null
  }
  return context
}

export const openingHours = (app: Application): void => {
  app.use('opening-hours', new OpeningHourService(getOptions(app)), {
    // No create/remove — the seven days are seeded and fixed.
    methods: ['find', 'get', 'patch'],
    events: []
  })

  app.service('opening-hours').hooks({
    around: {
      all: []
    },
    before: {
      // find/get are public so the website can read them without auth.
      patch: [authenticate('jwt'), requireAdmin, normalizeHours]
    },
    after: {},
    error: {}
  })
}
