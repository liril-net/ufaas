import { Schema } from 'mongoose'

export default function timestampPlugin (schema: Schema, options?: Object): void {
  schema.set('timestamps', true)
}
