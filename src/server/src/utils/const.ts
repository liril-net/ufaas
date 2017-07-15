import * as path from 'path'

export const base = path.join(__dirname, '../../../../')

export function resolve (dir): string {
  return path.join(base, '.', dir)
}
export const tmp = resolve('tmp')
export const logs = resolve('logs')
export const server = resolve('src/server')
export const cdn = resolve('cdn')
export const zip = resolve('cdn/zip')
export const unzip = resolve('cdn/unzip')
export const projects = resolve('cdn/projects')
