import * as Router from 'koa-router'
import * as config from 'config'
import * as requireDir from 'require-dir'
// import * as restc from 'restc'

import { values, mapValues } from 'lodash'
import { bindRoutes } from './utils/trafficlight'

const { version } = config.get('app') as any

const controllers = values(mapValues(requireDir('./controllers/', {
  camelcase: true,
}), (m) => m.default))

const APIRouter = new Router({
  prefix: `/${ version }`,
})

bindRoutes(APIRouter, controllers)

// const MainRouter = new Router()
// MainRouter.use(restc.koa2(), APIRouter.routes(), APIRouter.allowedMethods())

export default APIRouter
