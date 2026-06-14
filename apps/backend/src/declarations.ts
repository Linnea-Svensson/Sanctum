import { HookContext as FeathersHookContext, NextFunction } from '@feathersjs/feathers'
import { Application as KoaApplication } from '@feathersjs/koa'
import type { Knex } from 'knex'

export { NextFunction }

// Application configuration, populated from config/*.json and env vars.
export interface Configuration {
  host: string
  port: number
  origins: string[]
  paginate: {
    default: number
    max: number
  }
  authentication: Record<string, unknown>
  sqlite: Knex.Config
  // Set at runtime by configure(knexClient)
  sqliteClient: Knex
}

// Service type registry — augmented via `declare module` in each service file.
export interface ServiceTypes {}

export type Application = KoaApplication<ServiceTypes, Configuration>

export type HookContext<S = unknown> = FeathersHookContext<Application, S>
