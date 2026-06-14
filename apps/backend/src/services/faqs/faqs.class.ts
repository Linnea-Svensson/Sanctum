import { KnexService } from '@feathersjs/knex'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'
import type { Application } from '../../declarations.js'

export interface Faq {
  id: number
  question: string
  answer: string
  sortOrder: number
}

export type FaqData = Pick<Faq, 'question' | 'answer'> &
  Partial<Pick<Faq, 'sortOrder'>>
export type FaqPatch = Partial<FaqData>
export type FaqQuery = Partial<Faq>

export interface FaqParams extends KnexAdapterParams<FaqQuery> {}

export class FaqService extends KnexService<Faq, FaqData, FaqParams, FaqPatch> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: false,
    Model: app.get('sqliteClient'),
    name: 'faqs'
  }
}
