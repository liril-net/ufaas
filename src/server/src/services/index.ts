import * as requireDir from 'require-dir'

const services = requireDir('.', {
  camelcase: true,
})

export default services
