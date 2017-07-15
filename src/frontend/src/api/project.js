import axios from 'axios'

export async function list () {
  return axios.get('/project')
}

export async function get (id) {
  return axios.get(`/project/${ id }`)
}

export async function create (body) {
  return axios.post('/project', body)
}

export async function update (id, body) {
  return axios.patch(`/project/${ id }`, body)
}
