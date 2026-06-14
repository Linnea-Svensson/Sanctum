import { authenticate } from '@feathersjs/authentication'
import { hooks as localHooks } from '@feathersjs/authentication-local'
import type { Application } from '../../declarations.js'
import { UserService, getOptions } from './users.class.js'

const { hashPassword, protect } = localHooks

declare module '../../declarations.js' {
  interface ServiceTypes {
    users: UserService
  }
}

export const user = (app: Application): void => {
  app.use('users', new UserService(getOptions(app)), {
    methods: ['find', 'get', 'create', 'patch', 'remove'],
    events: []
  })

  app.service('users').hooks({
    around: {
      all: []
    },
    before: {
      all: [],
      find: [authenticate('jwt')],
      get: [authenticate('jwt')],
      create: [hashPassword('password')],
      patch: [authenticate('jwt'), hashPassword('password')],
      remove: [authenticate('jwt')]
    },
    after: {
      // Never send the password hash back to API clients.
      all: [protect('password')]
    },
    error: {
      all: []
    }
  })
}
