import * as HTTP_STATUS from 'http-status'
import { findKey } from 'lodash'
import logger from '../utils/logger'

export default async function (ctx: any, next: () => Promise<any>) {

  try {
    await next()
  } catch (e) {
    const type = e.constructor.name
    let { status = 500, message, name } = e

    if (type === 'MongooseError') {
      name = type
      status = 400
    }

    logger.error(e.stack || e.message)

    ctx.status = status

    if (name === 'MongoError' && message.indexOf('E11000') === 0) {
      ctx.status = 409
      message = '已存在'
    }

    ctx.body = {
      name: name || findKey(HTTP_STATUS, (s) => s === status) as string,
      message: message || HTTP_STATUS[status],
    }
  }

}
