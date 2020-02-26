import { EServerStatusCode } from '@common/enums'
import { EErrorCode } from '@packet/errorCode'

export interface ErrorExParam {
  message: string,
  statusCode?: EServerStatusCode,
  errorCode?: EErrorCode,
}

export default class WebError extends Error {
  public statusCode: EServerStatusCode;
  public errorCode: EErrorCode;

  constructor(errorParam: ErrorExParam) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = errorParam.message;
    this.statusCode = (undefined == errorParam.statusCode ? EServerStatusCode.ok : errorParam.statusCode);
    this.errorCode = (undefined == errorParam.errorCode ? EErrorCode.fail : errorParam.errorCode);
  }
}