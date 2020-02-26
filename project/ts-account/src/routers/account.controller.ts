import { Request, Response, NextFunction } from 'express';
import { EServerStatusCode } from '@common/enums';
import { EErrorCode } from '@packet/errorCode';
import * as commonInterface from '@common/interfaces';
import * as packet from '@packet/packetDataStruct';
import WebError from '@lib/webError';
import MysqlQuery from '@modules/mysqlQuery';
import ExpressSessionEx from '@modules/expressSession';

export async function login(req: Request, res: Response, next: NextFunction) {
  let reqData: packet.ReqLogin = req.body;

  try {
    // DB에서 계정 확인
    let retLoginData = await MysqlQuery.getInstance().queryLogin(reqData.id, reqData.pw);

    let resData: packet.ResLogin = {
      errorCode: EErrorCode.success
    };

    if(null == retLoginData.accountUsn) {
      resData.errorCode = EErrorCode.loginFail;
      res.json(resData);
      return;
    }

    // 중복 로그인 인지 확인
    let retErrorCode = await ExpressSessionEx.getInstance().checkDuplicateLogin(String(retLoginData.accountUsn), req.session!.id);
    if(EErrorCode.success != retErrorCode) {
      resData.errorCode = retErrorCode;
      res.json(resData);
      return;
    }

    // 세션 생성
    let user: commonInterface.IUser = {
      id: reqData.id,
      accountUsn : retLoginData.accountUsn,
      isKick: false,
    }
    req.session!.user = user;

    // 결과
    res.json(resData);
  } catch(err) {
    console.log(err);
    next(new WebError({
      message: "Server Error.",
      statusCode: EServerStatusCode.internalServerError
    }));
  }
}

export function logout(req: Request, res: Response, next: NextFunction) {
  req.session?.destroy((err) => {
    if(null != err) {
      next(new WebError({
        message: "Server Error.",
        statusCode: EServerStatusCode.internalServerError
      }));
      return;
    }

    let resPacket: packet.ResLogout = {
      errorCode: EErrorCode.success,
    }
    res.json(resPacket);
  });
}