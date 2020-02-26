import { IMysqlConfig } from '@lib/appConfigInterfaces'
import MysqlWrapper from '@lib/mysqlWrapper'
import * as returnType from './mysqlQueryReturnTypes'

export default class MysqlQuery {
  private static instance: MysqlQuery;
  private mysql?: MysqlWrapper;

  private constructor() {
  }

  public static getInstance() {
    if (null == MysqlQuery.instance) {
      MysqlQuery.instance = new MysqlQuery();
    }
    return MysqlQuery.instance;
  }

  public init(config: IMysqlConfig) {
    this.mysql = new MysqlWrapper();
    this.mysql.create(config)
  }

  public queryLogin(id: string, pw: string) : Promise<returnType.QueryLogin> {
    return new Promise((resolve, reject) => {
      this.mysql?.queryNormal({
        query:'SELECT accountUsn FROM tblAccount WHERE userId = ? AND Pw = ?',
        values: [id, pw]
      }, (err, rows: any, fields: any) => {
        if(err) {
          reject(err);
          return
        }

        resolve({
          accountUsn: (0 == rows.length ? null : rows[0].accountUsn)
        });
      });
    })
  }
}