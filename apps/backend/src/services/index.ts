import { user } from './users/users.js'
import type { Application } from '../declarations.js'

export const services = (app: Application): void => {
  app.configure(user)
  // Register additional services here.
}
