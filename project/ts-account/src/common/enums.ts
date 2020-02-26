export enum EServerStatusCode {
  ok = 200,                   // 성공
  badRequest = 400,           // 보내값이 올바르지 않다.
  notfound = 404,             // 없는 경로 접근
  internalServerError = 500,  // 서버에 문제가 있음.
}
