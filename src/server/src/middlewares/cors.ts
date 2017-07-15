export default async function (ctx: any, next: () => Promise<any>) {

  try {
    if (ctx.method === 'OPTIONS') {
      ctx.body = null
    } else {
      return await next()
    }
  } finally {
    const origin = ctx.headers.origin
    const acrm = ctx.headers['access-control-request-method'] || 'GET, POST, PUT, PATCH, DELETE'
    if (acrm) {
      ctx.set({ 'Access-Control-Allow-Methods': acrm })
    }
    if (origin) {
      ctx.set({ 'Access-Control-Allow-Origin': origin })
    }
    ctx.set({
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    })
  }

}
