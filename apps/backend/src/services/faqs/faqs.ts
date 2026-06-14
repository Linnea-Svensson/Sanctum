import { authenticate } from '@feathersjs/authentication'
import { Forbidden } from '@feathersjs/errors'
import type { Application, HookContext } from '../../declarations.js'
import { FaqService, getOptions } from './faqs.class.js'

declare module '../../declarations.js' {
  interface ServiceTypes {
    faqs: FaqService
  }
}

type FaqContext = HookContext<FaqService>

// Only signed-in admins may add, change or remove FAQ entries.
const requireAdmin = async (context: FaqContext): Promise<FaqContext> => {
  const { user } = context.params as { user?: { isAdmin?: boolean | number } }
  if (!user?.isAdmin) {
    throw new Forbidden('Endast administratörer får ändra vanliga frågor.')
  }
  return context
}

export const faqs = (app: Application): void => {
  app.use('faqs', new FaqService(getOptions(app)), {
    methods: ['find', 'get', 'create', 'patch', 'remove'],
    events: []
  })

  app.service('faqs').hooks({
    around: {
      all: []
    },
    before: {
      // find/get are public so the website can read them without auth.
      create: [authenticate('jwt'), requireAdmin],
      patch: [authenticate('jwt'), requireAdmin],
      remove: [authenticate('jwt'), requireAdmin]
    },
    after: {},
    error: {}
  })
}
