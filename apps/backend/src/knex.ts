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

// Default opening hours, seeded once when the table is first created.
// Mirrors what the website showed before the data became editable.
const DEFAULT_OPENING_HOURS = [
  { day: 'monday', label: 'Måndag', sortOrder: 1, closed: true, opens: null, closes: null },
  { day: 'tuesday', label: 'Tisdag', sortOrder: 2, closed: true, opens: null, closes: null },
  { day: 'wednesday', label: 'Onsdag', sortOrder: 3, closed: true, opens: null, closes: null },
  { day: 'thursday', label: 'Torsdag', sortOrder: 4, closed: false, opens: '16:00', closes: '21:00' },
  { day: 'friday', label: 'Fredag', sortOrder: 5, closed: false, opens: '16:00', closes: '21:00' },
  { day: 'saturday', label: 'Lördag', sortOrder: 6, closed: false, opens: '12:00', closes: '17:00' },
  { day: 'sunday', label: 'Söndag', sortOrder: 7, closed: false, opens: '12:00', closes: '17:00' }
]

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

  const hasOpeningHours = await db.schema.hasTable('opening_hours')
  if (!hasOpeningHours) {
    await db.schema.createTable('opening_hours', (table) => {
      table.increments('id')
      table.string('day').notNullable().unique() // 'monday' … 'sunday'
      table.string('label').notNullable() // Swedish display name
      table.integer('sortOrder').notNullable()
      table.boolean('closed').notNullable().defaultTo(false)
      table.string('opens') // 'HH:MM', null when closed
      table.string('closes')
    })
    await db('opening_hours').insert(DEFAULT_OPENING_HOURS)
  }
}
