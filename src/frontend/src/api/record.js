import axios from 'axios'

export async function list (env, project) {
  return axios.get(`/record/project/${ project }/${ env }`)
}

export async function transfer (body) {
  return axios.post('/record/transfer', body)
}

export async function rollback (body) {
  return axios.post('/record/rollback', body)
}

export async function upload (body) {
  return axios.post('/record/upload', body)
}
