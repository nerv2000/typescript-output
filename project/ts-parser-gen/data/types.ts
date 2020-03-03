import { EErrorCode } from "./errorCode"

//#region ResCommon 응답 보내는 데이터에 기본적으로 상속 해야함.
//   test
export interface ResCommon               
{
  errorCode            :               EErrorCode
}
//#endregion

//#region POST - account/login                        
export interface ReqLogin {              
  id      : string         ,    //                  아이디          @ex                     test
  pw    : string   //        패스 워드    @ex test
}

export interface        ResLogin             extends        ResCommon 
{
  // 주석을 넣어 봅니다.
  accountUsn:number
}
//#endregion

//#region DELETE - account/logout
export interface ReqLogout {
  _testValue1: string,
  test_value2:string,
}

export interface                ResLogout 
extends             ResCommon 
{
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

/**
 * hello 
 * world
 */
interface Test {
  val: string,
}