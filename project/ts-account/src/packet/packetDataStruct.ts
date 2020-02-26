import { EErrorCode } from "./errorCode"

//#region ResCommon 응답 보내는 데이터에 기본적으로 상속 해야함.
export interface ResCommon {
  errorCode: EErrorCode
}
//#endregion

//#region POST - account/login
export interface ReqLogin {
  id: string, // @ex test
  pw: string, // @ex test
}

export interface ResLogin extends ResCommon {
}
//#endregion

//#region DELETE - account/logout
export interface ReqLogout {
}

export interface ResLogout extends ResCommon {
}
//#endregion

//#region GET - user/status
export interface ReqUserStatus {
}

export interface ResUserStatus {
  id: (null | string),
  accountUsn: (null | number),
}
//#endregion