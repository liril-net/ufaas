import * as cluster from 'cluster'
import * as os from 'os'
import * as config from 'config'
import * as moment from 'moment'

import { start } from './app'
import logger from './utils/logger'

const { env } = config.get('app') as any

function fork () {
  if (cluster.isMaster) {
    let length = os.cpus().length
    while (length--) {
      cluster.fork()
    }

    cluster.on('exit', (worker) => {
      logger.info(`Worker ${ worker.process.pid } died at ${moment().format()}`)
    })

    return true
  }
  return false
}

if (env === 'prod') {
  if (!fork()) {
    start()
  }
} else {
  start()
}
