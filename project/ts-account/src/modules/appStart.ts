import { Server } from 'http';
import { IConfig } from '@lib/appConfigInterfaces';
import express, { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import SwaggerOption from './swaggerOption';
import WebError from '@lib/webError'
import { EServerStatusCode } from '@common/enums'
import { EErrorCode } from '@packet/errorCode';
import * as commonInterface from '@common/interfaces';
import MysqlQuery from './mysqlQuery';
import ExpressSessionEx from './expressSession';
import routersAccount from '@routers/account';
import routersUser from '@routers/user';


export default class AppStart {
  private _app: express.Application;
  private config: IConfig;

  constructor(config: IConfig) {
    this.config = config;
    this.initialize();
    this._app = express();
    this.use();
  }

  get app() {
    return this._app;
  }

  private initialize() {
    ExpressSessionEx.getInstance().init(this.config);
    MysqlQuery.getInstance().init(this.config.mysqlPool);
  }

  private use() {
    this._app.use(ExpressSessionEx.getInstance().session!);
    this._app.use(express.urlencoded({extended: true}))
    this._app.use(express.json());
    const swaggerOption = new SwaggerOption(this.config.port);
    this._app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerOption.swaggerJSDoc));
    this._app.use('/account', [this.headerCheck, this.checkAccountDuplicate], routersAccount);
    this._app.use('/user', [this.checkAccountDuplicate], routersUser);
    this._app.all('*', this.notFound);
    this._app.use(this.errorHandling);
  }

  private headerCheck(req: Request, res: Response, next: NextFunction) {
    let contype = req.headers['content-type'];
    if (!contype || contype.toLowerCase().indexOf('application/json') != 0) {
      next(new WebError({
        message: "Error: content-type is application/json only support",
        statusCode: EServerStatusCode.badRequest,
      }));
      return;
    }

    next();
  }

  private checkAccountDuplicate(req: Request, res: Response, next: NextFunction) {
    if(!req.session) {
      next();
      return;
    }

    // 로그아웃 처리
    let user: commonInterface.IUser = req.session!.user;
    if(null == user) {
      next();
      return;
    }

    if(null != user &&
      false == user.isKick) {
      ExpressSessionEx.getInstance().expireSessionAccount(String(user.accountUsn));
      next();
      return;
    }

    req.session!.destroy((err) => {
      if(null != err) {
        next(new WebError({
          message: "Server Error.",
          statusCode: EServerStatusCode.internalServerError
        }));
        return;
      }

      next(new WebError({
        message: "",
        statusCode: EServerStatusCode.ok,
        errorCode: EErrorCode.loginDuplicate,
      }));
      return;
    });
  }

  private notFound(req: Request, res: Response, next: NextFunction) {
    next(new WebError({
      message: `Cannot ${req.method} ${req.path}`,
      statusCode: EServerStatusCode.notfound,
    }));
  }

  private errorHandling(err: WebError, req: Request, res: Response, next: NextFunction) {
    console.log("consoleLog: ", err);
    res.status(err.statusCode).json({
      errorCode: err.errorCode,
    });
  }

  public listen(port: number): Promise<Server> {
    return new Promise( (resolve) => {
      let server: Server = this._app.listen(port, () => {
        console.log(`Server app listening on port ${port}`);
        resolve(server);
      });
    });
  }
}
