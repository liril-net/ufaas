import { model, Schema } from 'mongoose'
import { IRecordModel } from 'typings/models.d'

const schema = new Schema(
  {
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    description: { type: String, required: true },
    env: { type: String, required: true },
    unzip: { type: String, required: true },
    zip: { type: String, required: true },
    origin: { type: String },
    type: { type: String }
  },
)

export default model<IRecordModel>('Record', schema)
