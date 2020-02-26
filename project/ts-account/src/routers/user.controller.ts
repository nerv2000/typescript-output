import { Request, Response, NextFunction } from 'express';
import * as packet from '@packet/packetDataStruct'
import * as commonInterface from '@common/interfaces';

export function status(req: Request, res: Response, next: NextFunction) {
  let reqData: packet.ReqUserStatus = req.body;

  let resData: packet.ResUserStatus = {
    id: null,
    accountUsn: null,
  }

  if(req.session?.user) {
    let user: commonInterface.IUser = req.session.user;
    resData.id = user.id;
    resData.accountUsn = user.accountUsn;
  }

  res.json(resData);
}