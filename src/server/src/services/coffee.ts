
/**
 * 根据  token 获取用户信息
 *
 * @export
 * @param {string} token
 * @returns
 */
export async function getUserByToken (token: string): Promise<any> {
  return {
    name: 'test',
  }
}
