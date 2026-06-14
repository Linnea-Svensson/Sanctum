import { user } from './users/users.js'
import { openingHours } from './opening-hours/opening-hours.js'
import type { Application } from '../declarations.js'

export const services = (app: Application): void => {
  app.configure(user)
  app.configure(openingHours)
  // Register additional services here.
}
