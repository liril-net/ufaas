import * as config from 'config'
import * as moment from 'moment'
import * as path from 'path'
import * as fs from 'fs-extra'
import * as restc from 'restc'

// Koa
import * as Koa from 'koa'
import * as koaBody from 'koa-body'
import * as koaLogger from 'koa-logger'

// Middleware
import cors from './middlewares/cors'
import error from './middlewares/error'

import { connect } from './models'
import logger from './utils/logger'
import router from './router'
import { tmp } from './utils/const'

const { port } = config.get('app') as any

export async function start () {
  await connect()
  await fs.ensureDir(tmp)
  const app: Koa = new Koa()

  app
    .use(error)
    .use(cors)
    .use(restc.koa2())
    .use(koaBody({
      multipart: true,
      formidable: {
        hash: 'md5',
        uploadDir: path.join(__dirname, '../../../tmp/')
      }
    }))
    .use(koaLogger())
    .use(router.routes())
    .use(router.allowedMethods())

  app.listen(port)
  logger.info(`Listening to ${port} at ${moment().format()}`)
}
