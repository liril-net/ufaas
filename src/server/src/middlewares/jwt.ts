import * as config from 'config'
import { verify } from 'jsonwebtoken'
import models from '../models'

const { secret } = config.get('jwt') as any

export default function JWT () {

  return async function (ctx: any, next: () => Promise<any>) {
    const {
      authorization,
    } = ctx.headers
    ctx.assert(authorization, 401)
    const regexp = /Bearer (.*)$/
    if (authorization && authorization.match(regexp)) {
      const [ , token ] = authorization.match(regexp)
      ctx.assert(token, 401)
      try {
        const decoded = verify(token, secret, {
          issuer: 'ufaas'
        }) as any
        const { username } = decoded
        const user = await models.user.findOne({
          username
        })
        ctx.state.$currentUser = user
      } catch (e) {
        ctx.throw(401)
      }
    }

    await next()
  }

}
