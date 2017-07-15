import {
  pick,
  omit,
} from 'lodash'

import {
  Controller,
  Get,
  Ctx,
  Use,
  Post,
  Body,
  CurrentUser,
  Param,
} from '../utils//trafficlight'

import {
  IUserModel,
  IRecordModel,
} from 'typings/models'

import * as path from 'path'
import * as fs from 'fs-extra'
import * as decompress from 'decompress'

import models from '../models'
import jwt from '../middlewares/jwt'
import {
  projects as projectsDir,
  zip as zipDir,
  unzip as unzipDir,
} from '../utils/const'
import ln from '../utils/ln'

const keys = Object.keys(models.record.schema.obj)

@Controller('/record')
@Use(jwt())
export default class RecordController {

  @Get('/project/:id')
  public async findByProjectId (
    @Param('id') id,
    @Ctx() ctx,
  ): Promise<IRecordModel[]> {
    ctx.assert(id, 400, '项目 ID 不能为空')
    const records = await models.record.find({
      project: id
    }).sort('-updatedAt')

    return records
  }

  @Get('/project/:id/:env')
  public async findByProjectIdAndEnv (
    @Param('id') id,
    @Param('env') env,
    @Ctx() ctx,
  ): Promise<IRecordModel[]> {
    ctx.assert(id, 400, '项目 ID 不能为空')
    ctx.assert(env, 400, '环境不能为空')

    const records = await models.record.find({
      project: id,
      env
    }).sort('-updatedAt')

    return records
  }


  @Post('/upload')
  public async create (
    @CurrentUser() user: IUserModel,
    @Body() body: IRecordModel,
    @Ctx() ctx,
  ): Promise<IRecordModel> {
    let picked = pick(body, keys) as any
    picked = omit(picked, 'origin')
    ctx.assert(picked.project, 400, '项目不能为空')
    ctx.assert(picked.zip, 400, '文件不能为空')
    ctx.assert(picked.env, 400, '环境不能为空')

    // 寻找对应的项目
    const project = await models.project.findById(picked.project)
    ctx.assert(project, 400, '没有对应的项目')

    // 判断环境是否正确
    ctx.assert(project.env.find(e => e === picked.env), 400, '环境不存在')
    const envDir = path.join(projectsDir, project.name, picked.env)

    // 查找对应的压缩文件
    const zip = await models.upload.findOne({ hash: picked.zip })
    ctx.assert(zip, 400, '没有对应文件')
    ctx.assert(/^application\/zip$/.test(zip.type), 400, '文件应为 zip 压缩文件')

    // 移动到 cdn 的 zip
    const zipFile = path.join(zipDir, zip.originHash + '.' + zip.type.split('/')[1])
    await fs.copy(zip.path, zipFile, {
      overwrite: true
    })
    picked.zip = zipFile

    // 解压
    const unzipFile = path.join(unzipDir, zip.originHash)
    await decompress(zipFile, unzipFile)

    // 创建关联
    await ln(unzipFile, envDir)

    picked.user = user
    picked.username = user.username
    picked.unzip = unzipFile
    picked.type = 'upload'

    const record = await models.record.create(picked)
    return record
  }

  @Post('/transfer')
  public async transfer (
    @CurrentUser() user,
    @Body() body: any,
    @Ctx() ctx
  ): Promise<IRecordModel> {
    let picked = pick(body, [
      'id',
      'env',
      'description',
    ]) as any

    ctx.assert(picked.id, 400, '原记录 ID 不能为空')
    ctx.assert(picked.env, 400, '新环境不能为空')

    // 查找原记录
    const originRecord = await models.record.findById(picked.id).populate('project')
    ctx.assert(originRecord, 400, '不存在原记录')
    ctx.assert(originRecord.env !== picked.env, 400, '新旧环境重复')

    // 判断环境是否村子
    ctx.assert(originRecord.project.env.find(e => e === picked.env), 400, '环境不存在')

    // 查找新环境路径
    const envDir = path.join(projectsDir, originRecord.project.name, picked.env)

    // 关联
    await ln(originRecord.unzip, envDir)

    // 保存新纪录
    let newPicked = pick(originRecord, keys) as any
    newPicked.origin = picked.id
    newPicked.env = picked.env
    if (picked.description) {
      newPicked.description = picked.description
    }
    newPicked.type = 'transfer'
    newPicked.user = user
    newPicked.username = user.username

    const record = await models.record.create(newPicked)
    return record
  }

  @Post('/rollback')
  public async rollback (
    @CurrentUser() user,
    @Body() body,
    @Ctx() ctx,
  ): Promise<IRecordModel> {
    const { id } = body
    ctx.assert(id, 400, '袁记录 ID 不能为空')
    // 查找原记录
    const originRecord = await models.record.findById(id).populate('project')
    ctx.assert(originRecord, 400, '不存在原记录')

    // 查找新环境路径
    const envDir = path.join(projectsDir, originRecord.project.name, originRecord.env)

    // 关联
    await ln(originRecord.unzip, envDir)

    // 保存新纪录
    let newPicked = pick(originRecord, keys) as any
    newPicked.origin = id
    newPicked.type = 'rollback'
    newPicked.user = user
    newPicked.username = user.username

    const record = await models.record.create(newPicked)
    return record
  }
}
