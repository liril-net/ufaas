import 'winston-daily-rotate-file'

import * as config from 'config'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as winston from 'winston'
import { base } from './const'

const {
  Console,
  DailyRotateFile,
} = winston.transports as any

const { directory } = config.get('logger') as any
const logDirectory = path.resolve(base, directory)
fs.ensureDirSync(logDirectory)

const logger: winston.LoggerInstance = new (winston.Logger)({
  transports: [
    new Console({
      colorize: true,
      humanReadableUnhandledException: true,
      level: 'debug',
      prettyPrint: true,
      stringify: true,
    }),
    new DailyRotateFile({
      datePattern: 'yyyy-MM-dd.',
      filename: path.join(logDirectory, 'log'),
      level: 'info',
      prepend: true,
    }),
  ],
})

export default logger
