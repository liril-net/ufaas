import {
  pick,
} from 'lodash'

import {
  Controller,
  Use,
  Post,
  Body,
  File,
  Ctx,
} from '../utils//trafficlight'

import * as fs from 'fs-extra'
import * as path from 'path'

import models from '../models'
import jwt from '../middlewares/jwt'
import { tmp } from '../utils/const'

const keys = Object.keys(models.upload.schema.obj)

@Controller('/upload')
@Use(jwt())
export default class UploadController {

  @Post('/')
  public async create (
    @File() file,
    @Body() body,
    @Ctx() ctx,
  ): Promise<string> {
    ctx.assert(file, 400, '文件不能为空')

    // 复制到另一个位置
    const { hash, type } = file
    const [ , dir1, dir2, rest ] = hash.match(/^(.)(..)(.*)$/)
    const destDir = path.join(tmp, dir1, dir2)
    await fs.ensureDir(destDir)
    const fileName = rest + type.split('/')[1]
    const dest = path.join(destDir, fileName)
    const reader = fs.createReadStream(file.path)
    const stream = fs.createWriteStream(dest)
    reader.pipe(stream)

    // 移除旧文件
    await fs.remove(file.path)

    // 保存记录
    const picked = pick(file, keys) as any
    picked.hash = dir1 + dir2 + fileName
    picked.originHash = file.hash
    picked.path = dest

    const upload = await models.upload.findOne({
      hash: picked.hash
    })
    if (!upload) {
      await models.upload.create(picked)
    }

    return picked.hash
  }
}
