import express from 'express';
import expressSession from 'express-session';
import cr from 'connect-redis';
const RedisStore = cr(expressSession);
import { IConfig } from '@lib/appConfigInterfaces';
import RedisWrapper from '@lib/redisWrapper';
import { EErrorCode } from '@packet/errorCode';

interface IGetSession {
  sid: string,
  session?: (null | Express.SessionData),
}

export default class ExpressSessionEx {
  private static instance: ExpressSessionEx;
  private config?: IConfig;
  private redisWrapper?: RedisWrapper;
  private redisStore?: cr.RedisStore;
  private _session?: express.RequestHandler;
  private readonly mainKey = 'loginUser';

  private constructor() {
  }

  public static getInstance() {
    if (null == ExpressSessionEx.instance) {
      ExpressSessionEx.instance = new ExpressSessionEx();
    }
    return ExpressSessionEx.instance;
  }

  public init(config: IConfig) {
    this.config = config;
    this.redisWrapper = new RedisWrapper(config.redisStore);
    this.redisStore = new RedisStore({
      client: this.redisWrapper.redisClient,
      ttl: config.maxAge
    });
    this._session = expressSession({
      secret: config.secret,
      saveUninitialized: false,
      resave: false,
      store: this.redisStore,
    });
  }

  get session() {
    return this._session;
  }

  private getSession(sid: string): Promise<IGetSession> {
    return new Promise((resolve, reject) => {
      this.redisStore!.get(sid, (err, session) => {
        if(err) {
          reject(err);
          return;
        }
        resolve({
          sid: sid,
          session: session,
        });
      });
    });
  }

  private setSession(sid: string, sessionData: Express.SessionData): Promise<void> {
    return new Promise((resolve, reject) => {
      this.redisStore!.set(sid, sessionData, (err) => {
        if(err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  private combinationKey(accountUsn: string) {
    return (this.mainKey + ":" + accountUsn);
  }

  private getSessionAccount(accountUsn: string): Promise<(null|string)> {
    return new Promise((resolve, reject) => {
      this.redisWrapper!.redisClient.get(this.combinationKey(accountUsn), (err, reply) => {
        if(err) {
          reject(err);
          return;
        }
        resolve(reply);
      });
    });
  }

  private setSessionAcount(accountUsn: string, value: string) : Promise<void> {
    return new Promise((resolve, reject) => {
      let key = this.combinationKey(accountUsn);
      this.redisWrapper!.redisClient
      .multi()
      .set(key, value)
      .expire(key, this.config!.maxAge + 5)
      .exec((err) => {
        if(err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  public expireSessionAccount(accountUsn: string) {
    this.redisWrapper!.redisClient.expire(this.combinationKey(accountUsn), this.config!.maxAge + 5);
  }

  public checkDuplicateLogin(accountUsn: string, newSid: string) : Promise<EErrorCode>{
    return new Promise(async (resolve, reject) => {
      try {
        // 중복 로그인 체크
        let prevSid = await this.getSessionAccount(accountUsn);

        // 처음 로그인 했는지 체크
        if(!prevSid) {
          this.setSessionAcount(accountUsn, newSid);
          resolve(EErrorCode.success);
          return;
        }

        // 이전 세션 정보 있는지 체크
        let retPrevSesssion = await this.getSession(prevSid);

        // 이전 세션이 존재하는지 체크
        if(!retPrevSesssion.session) {
          this.setSessionAcount(accountUsn, newSid);
          resolve(EErrorCode.success);
          return;
        }

        // 이전 세션과 같으면 두번 로그인 시도 (이건 어떻게 처리 하지?)
        if(retPrevSesssion.sid == newSid) {
          resolve(EErrorCode.fail);
          console.log('로그인 여러번 시도')
          return;
        }

        // 이전 세션 데이터 로그아웃 정보 갱신 처리
        retPrevSesssion.session!.user.isKick = true;
        await this.setSession(retPrevSesssion.sid, retPrevSesssion.session);

        // 새로운 세션 로그인 처리
        this.setSessionAcount(accountUsn, newSid);
        resolve((EErrorCode.success));
        console.log(`중복로그인 : accountUsn ${accountUsn} prevSid:${retPrevSesssion.sid} newSid:${newSid}`);
      } catch(err) {
        reject(err);
      }
    });
  }
}



