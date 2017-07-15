import {
  Controller,
  Get,
  Post,
  Ctx,
  Body,
  Use,
  CurrentUser,
} from '../utils//trafficlight'

import {
  IUserModel,
} from 'typings/models'

import {
  sign,
} from 'jsonwebtoken'

import * as config from 'config'
import models from '../models'
import jwt from '../middlewares/jwt'

const { secret } = config.get('jwt') as any

@Controller('/user')
export default class PingController {
  /**
   * @summary 获取当前用户
   */
  @Get('/')
  @Use(jwt())
  public async get (
    @CurrentUser() user,
  ): Promise<IUserModel> {
    return user
  }

  @Post('/signup')
  public async signup (
    @Ctx() ctx,
    @Body() body: IUserModel,
  ): Promise<string> {
    ctx.assert(body.username && body.password, 422)

    const user = await models.user.create(body)

    const { username } = user

    const paylaod = {
      username,
    }

    const token = sign(paylaod, secret, {
      expiresIn: '2h',
      audience: username,
      issuer: 'ufaas',
    })

    return token
  }

  @Post('/login')
  public async login (
    @Ctx() ctx,
    @Body() body: IUserModel,
  ): Promise<string> {
    ctx.assert(body.username && body.password, 422)

    const user = await models.user.logIn(body)
    ctx.assert(user, 401)
    const { username } = user

    const paylaod = {
      username,
    }

    const token = sign(paylaod, secret, {
      expiresIn: '2h',
      audience: username,
      issuer: 'ufaas',
    })

    return token
  }
}
