import {
  Controller,
  Get,
} from '../utils//trafficlight'

import sleep from '../utils/sleep'

@Controller('/ping')
export default class PingController {
  /**
   * @summary ping 测试连接
   */
  @Get('/')
  public async get (): Promise<string> {
    await sleep(1000)
    return 'Pong'
  }
}
