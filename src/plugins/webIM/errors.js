import constant from './constant'

export class TencentImError extends Error {
  constructor (
    {
      message = constant.LEFAN_STATUS_CODE.TENCENT_IM_ERROR_CODE.message,
      code = constant.LEFAN_STATUS_CODE.TENCENT_IM_ERROR_CODE.code,
      detail = {}
    }
  ) {
    super(message)
    this.message = message
    this.code = code
    this.detail = detail
  }
}
