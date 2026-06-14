import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'
import type { Application } from '../../declarations.js'

export interface OpeningHour {
  id: number
  day: string // 'monday' … 'sunday'
  label: string // Swedish display name, e.g. 'Måndag'
  sortOrder: number
  // SQLite stores booleans as 0/1, so API clients may receive either.
  closed: boolean | number
  opens: string | null // 'HH:MM'
  closes: string | null
}

// Only the time fields are ever updated; the day/label/order are fixed.
export type OpeningHourPatch = Partial<Pick<OpeningHour, 'closed' | 'opens' | 'closes'>>
export type OpeningHourQuery = Partial<OpeningHour>

export interface OpeningHourParams extends KnexAdapterParams<OpeningHourQuery> {}

export class OpeningHourService extends KnexService<
  OpeningHour,
  OpeningHourPatch,
  OpeningHourParams,
  OpeningHourPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: false,
    Model: app.get('sqliteClient'),
    name: 'opening_hours'
  }
}
