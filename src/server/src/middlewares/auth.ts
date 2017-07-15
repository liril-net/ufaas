import { intersection } from 'lodash'

/**
 * 判断是否有自定的角色
 *
 * @export
 * @param {any} roles
 * @returns
 */
export function RoleAuth (roles) {

  return async function (ctx: any, next: () => Promise<any>) {
    const user = ctx.state.$currentUser

    ctx.assert(intersection(user.roles, roles).length, 403)

    await next()
  }

}
