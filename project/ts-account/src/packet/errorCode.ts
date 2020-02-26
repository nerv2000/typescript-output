export enum EErrorCode {
  success = 0,  // 성공
  fail = -1,    // 실패

  loginFail = 1000,   // 로그인 실패
  loginDuplicate,     // 중복 로그인
}