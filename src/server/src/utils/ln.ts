import { spawn } from 'child_process'
import * as fs from 'fs-extra'
import * as path from 'path'

export default async function ln (src, target) {
  await fs.ensureDir(path.dirname(target))
  await fs.remove(target)

  return new Promise((resolve, reject) => {
    const cmd = spawn('ln', ['-sf', src, target])

    cmd.stderr.on('data', data => {
      console.error(data)
      reject(data)
    })

    cmd.on('close', code => {
      if (!code) {
        resolve()
      }
    })
  })
}
