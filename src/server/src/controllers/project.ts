import {
  pick,
  extend,
} from 'lodash'

import {
  Controller,
  Get,
  Use,
  Post,
  Patch,
  Body,
  Param,
  Ctx,
  CurrentUser,
} from '../utils//trafficlight'

import {
  IUserModel,
  IProjectModel,
} from 'typings/models'

import models from '../models'
import jwt from '../middlewares/jwt'

const keys = Object.keys(models.project.schema.obj)

@Controller('/project')
@Use(jwt())
export default class ProjectController {
  /**
   * @summary 项目列表
   */
  @Get('/')
  public async list (): Promise<IProjectModel[]> {
    const projects = await models.project.find().sort('-updatedAt')
    return projects
  }

  @Get('/:id')
  public async get (
    @Param('id') id,
  ): Promise<IProjectModel> {
    const project = await models.project.findById(id)
    return project
  }

  /**
   * 创建新项目
   * @param user 当前登录用户
   * @param body
   */
  @Post('/')
  public async create (
    @CurrentUser() user: IUserModel,
    @Body() body: IProjectModel,
  ): Promise<IProjectModel> {
    const picked = pick(body, keys) as any
    let { privilege } = picked

    let exist = true
    if (!Array.isArray(privilege)) {
      privilege = picked.privilege = []
      exist = false
    } else {
      exist = privilege.find(p => p.useraname === user.username)
    }

    if (!exist) {
      picked.privilege.unshift({
        useraname: user.username,
        role: 'owner'
      })
    }
    const project = await models.project.create(picked)
    return project
  }

  /**
   * 更新
   * @param user 当前登录用户
   * @param body
   */
  @Patch('/:id')
  public async update (
    @CurrentUser() user: IUserModel,
    @Param('id') id,
    @Body() body: IProjectModel,
    @Ctx() ctx,
  ): Promise<IProjectModel> {
    let project = await models.project.findById(id)
    ctx.assert(project, 404, '没有对应的项目')

    const picked = pick(body, keys) as any
    delete picked.name
    let { privilege } = picked

    let exist = true
    if (!Array.isArray(privilege)) {
      privilege = picked.privilege = []
      exist = false
    } else {
      exist = privilege.find(p => p.useraname === user.username)
    }

    if (!exist) {
      picked.privilege.unshift({
        useraname: user.username,
        role: 'owner'
      })
    }

    project = extend(project, picked)
    project = await project.save()
    return project
  }
}
