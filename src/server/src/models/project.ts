import { model, Schema } from 'mongoose'
import { IProjectModel } from 'typings/models.d'

const schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    env: { type: Array, default: () => [ 'alpha', 'beta', 'production' ] },
    privilege: { type: Array, default: () => [] },
  },
)

export default model<IProjectModel>('Project', schema)
