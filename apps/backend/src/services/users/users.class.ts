import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'
import type { Application } from '../../declarations.js'

export interface User {
  id: number
  email: string
  password?: string
  isAdmin: boolean
  createdAt: string
}

export type UserData = Pick<User, 'email' | 'password'> & Partial<Pick<User, 'isAdmin'>>
export type UserPatch = Partial<UserData>
export type UserQuery = Partial<User>

export interface UserParams extends KnexAdapterParams<UserQuery> {}

export class UserService extends KnexService<User, UserData, UserParams, UserPatch> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('sqliteClient'),
    name: 'users'
  }
}
