const config = require('./config')

module.exports = {
  port: config.dev.port,
  script: [
    'yarn dev'
  ]
}
