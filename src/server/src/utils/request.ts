import { extend, isObject } from 'lodash'
import { template } from 'lodash'
import fetch, { RequestInit, Response } from 'node-fetch'
import * as Boom from 'boom'

import {
  format,
  parse,
} from 'url'

export async function request (method: string, url: string, options: any = {}): Promise<Response> {
  const {
    params,
    headers,
    query,
  } = options

  const config: RequestInit = extend({
    method,
  }, options)

  config.headers = extend({
    'Content-Type': 'application/json;charset=utf-8',
  }, headers)

  let target: any = parse(url)

  if (params) {
    target.pathname = template(target.pathname, {
      interpolate: /\:([^\/]+)/g,
    })(params)
  }

  if (query) {
    target.query = query
  }
  target = format(target)

  if (isObject(config.body)) {
    config.body = JSON.stringify(config.body as any)
  }

  const response = await fetch(target, config)
  let result: any

  try {
    if (response.json) {
      result = await response.json()
    } else if (response.text) {
      result = await response.text()
    }
  } catch (ignore) {
    // tslint-ignore
  }

  if (response.status !== 200) {
    if (result.message) {
      result = result.message
    }
    throw Boom.create(response.status, result)
  }
  return result
}

export default request
export const get = async (url: string, options?: any): Promise<Response> => request('GET', url, options)
export const post = async (url: string, options?: any): Promise<Response> => request('POST', url, options)
export const put = async (url: string, options?: any): Promise<Response> => request('PUT', url, options)
export const patch = async (url: string, options?: any): Promise<Response> => request('PATCH', url, options)
export const del = async (url: string, options?: any): Promise<Response> => request('DELETE', url, options)
