import { user } from './users/users.js'
import { openingHours } from './opening-hours/opening-hours.js'
import { faqs } from './faqs/faqs.js'
import type { Application } from '../declarations.js'

export const services = (app: Application): void => {
  app.configure(user)
  app.configure(openingHours)
  app.configure(faqs)
  // Register additional services here.
}
