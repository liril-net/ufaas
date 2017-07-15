import axios from 'axios'

export async function login (username, password) {
  return axios.post('/user/login', {
    username,
    password
  }, {
    noAuth: true
  })
}

export async function signup (username, password) {
  return axios.post('/user/signup', {
    username,
    password
  }, {
    noAuth: true
  })
}

export async function me () {
  return axios.get('/user')
}
