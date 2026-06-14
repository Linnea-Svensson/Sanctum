import knex from 'knex'
import type { Knex } from 'knex'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import type { Application } from './declarations.js'

// Create the Knex client from the `sqlite` config block and store it on the app.
export const knexClient = (app: Application): void => {
  const config = app.get('sqlite')
  const filename = (config.connection as Knex.Sqlite3ConnectionConfig | undefined)?.filename
  if (filename && filename !== ':memory:') {
    mkdirSync(dirname(filename), { recursive: true })
  }
  const db = knex(config)
  app.set('sqliteClient', db)
}

// Ensure the tables this app needs exist. Idempotent — safe to call on every boot.
export const ensureSchema = async (db: Knex): Promise<void> => {
  const hasUsers = await db.schema.hasTable('users')
  if (!hasUsers) {
    await db.schema.createTable('users', (table) => {
      table.increments('id')
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.boolean('isAdmin').notNullable().defaultTo(false)
      table.timestamp('createdAt').defaultTo(db.fn.now())
    })
  }
}
