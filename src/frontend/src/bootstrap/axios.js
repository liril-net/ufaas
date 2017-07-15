import axios from 'axios'
import instance from '@/main'
import { Message, Loading } from 'element-ui'

let _loading = {}
let _index = 0

const interceptors = {
  request: {
    auth (config) {
      if (config.noAuth) {
      } else {
        config.headers.Authorization = `Bearer ${ window.sessionStorage.token }`
      }
      return config
    },

    common (config) {
      config._index = _index++
      _loading[config._index] = Loading.service({
        fullscreen: true
      })
      return config
    }
  },

  response: {
    auth (response) {
      return response
    },

    common (response) {
      const {
        config
      } = response

      if (_loading[config._index]) {
        _loading[config._index].close()
      }

      return response
    }
  },

  error: {
    auth (error) {
      const {
        status
      } = error.response

      if (status === 401) {
        if (instance.$route.name !== 'Login') {
          instance.$router.push({
            name: 'Login',
            query: {
              from: window.location.href
            }
          })
        } else {
          Message.error('账号或密码错误！')
        }
      }
      return Promise.reject(error)
    },

    common (error) {
      const {
        config
      } = error.response

      if (_loading[config._index]) {
        _loading[config._index].close()
      }

      return Promise.reject(error)
    }
  }
}

axios.defaults.baseURL = `http://api.ufaas.me/v1/`
axios.interceptors.request.use(interceptors.request.common)
axios.interceptors.request.use(interceptors.request.auth)

axios.interceptors.response.use(interceptors.response.common, interceptors.error.common)
axios.interceptors.response.use(interceptors.response.auth, interceptors.error.auth)
