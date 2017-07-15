import * as config from 'config'
import * as mongoose from 'mongoose'
import * as moment from 'moment'
import * as requireDir from 'require-dir'
import { mapValues } from 'lodash'

import logger from '../utils/logger'

// plugins
import timestampPlugin from '../models/plugins/timestamp'
import restfulPlugin from '../models/plugins/restful'

const { url } = config.get('mongodb') as any

(mongoose as any).Promise = Promise
mongoose.plugin(timestampPlugin)
mongoose.plugin(restfulPlugin)

let connection

export async function connect () {
  return new Promise((resolve, reject) => {
    mongoose.connect(url)
    connection = mongoose.connection

    connection.on('error', (...args) => {
      reject()
      logger.error.apply(null, args)
    })

    connection.on('open', () => {
      resolve()
      logger.info(`Connect to ${url} at ${moment().format()}`)
    })
  })
}

const models = mapValues(requireDir('.', {
  camelcase: true,
}), (m) => m.default)

export default models
export const db = connection
