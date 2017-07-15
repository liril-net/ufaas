import { model, Schema } from 'mongoose'
import { IRecordModel } from 'typings/models.d'

const schema = new Schema(
  {
    size: { type: Number },
    path: { type: String, required: true },
    name: { type: String },
    type: { type: String },
    hash: { type: String, required: true, unique: true },
    originHash: { type: String, required: true },
  },
)

export default model<IRecordModel>('Upload', schema)
