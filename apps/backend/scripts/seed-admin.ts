import 'dotenv/config'
import { app } from '../src/app.js'
import { ensureSchema } from '../src/knex.js'
import { logger } from '../src/logger.js'

// Creates (or updates) the admin user from ADMIN_EMAIL / ADMIN_PASSWORD in .env.
// The password is hashed by the users service `hashPassword` hook.
async function seedAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!email || !password) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD must be set in apps/api/.env (see .env.example)'
    )
  }

  const db = app.get('sqliteClient')
  await ensureSchema(db)

  const users = app.service('users')
  const matches = await users.find({
    query: { email },
    paginate: false
  })

  if (matches.length > 0) {
    await users.patch(matches[0].id, { password, isAdmin: true })
    logger.info(`Updated existing admin user: ${email}`)
  } else {
    await users.create({ email, password, isAdmin: true })
    logger.info(`Created admin user: ${email}`)
  }

  await db.destroy()
}

seedAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error(error instanceof Error ? error.message : error)
    process.exit(1)
  })
