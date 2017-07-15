import { model, Schema, DocumentQuery } from 'mongoose'
import { IUserModel } from 'typings/models.d'
import { hash, compare } from 'bcrypt'

const ROUND = 10

const schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: { type: Array, default: () => [] },
  },
)

schema.pre('save', async function (this: IUserModel, next) {
  this.password = await hash(this.password, ROUND)
  next()
})

schema.statics.logIn = async function (
  this: DocumentQuery<any, IUserModel>,
  { username, password }: IUserModel,
  ) {
  const user = await this.findOne({ username })

  if (user) {
    const valid = await compare(password, user.password)
    if (valid) {
      return user
    }
  }

  return null
}

export default model<IUserModel>('User', schema)
