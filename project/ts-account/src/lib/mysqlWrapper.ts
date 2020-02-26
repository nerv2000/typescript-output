import mysql, { PoolConnection } from 'mysql';
import { IMysqlConfig } from './appConfigInterfaces'

type QueryCallbackFunc = (err: (Error | null), rows: unknown, fields: unknown) => void;

type QueryParam = {
  query: string,
  values? : unknown
}

type ReturnGetConnection = {
  err: (Error | null),
  connection: (PoolConnection | null),
}

type ReturnQuery = {
  err: (Error | null),
  rows: unknown,
  fields: unknown,
}

type ReturnTransaction = (Error | null);

export default class MysqlWrapper {
  private poolConnection!: mysql.Pool;

  public create(config: IMysqlConfig) : boolean {
    if(undefined == config.connectionLimit ||
      undefined != this.poolConnection) {
      return false;
    }

    this.poolConnection = mysql.createPool({
      host: config.host
      , port: config.port
      , user: config.user
      , password: config.password
      , database: config.database
      , connectionLimit: config.connectionLimit
    });

    return true;
  }

  public async queryNormal(input: QueryParam, callback: QueryCallbackFunc) {
    let retGetConnObj: ReturnGetConnection = await this.getConnection();
    if(null != retGetConnObj.err) {
      callback(retGetConnObj.err, null, null);
      return;
    } else if(null == retGetConnObj.connection) {
      callback(new Error("connection is null"), null, null);
      return;
    }

    let retQueryObj: ReturnQuery = await this.query(retGetConnObj.connection, input);
    if(null != retQueryObj.err) {
      callback(retGetConnObj.err, null, null);
      return;
    }

    retGetConnObj.connection.release();

    callback(null, retQueryObj.rows, retQueryObj.fields);
  }

  public async queryTransaction(input: QueryParam, callback: QueryCallbackFunc) {
    let retGetConnObj: ReturnGetConnection = await this.getConnection();
    if(null != retGetConnObj.err) {
      callback(retGetConnObj.err, null, null);
      return;
    } else if(null == retGetConnObj.connection) {
      callback(new Error("connection is null"), null, null);
      return;
    }

    let retErr: ReturnTransaction = await this.beginTransaction(retGetConnObj.connection);
    if(null != retErr) {
      callback(retGetConnObj.err, null, null);
      return;
    }

    let retQueryObj: ReturnQuery = await this.query(retGetConnObj.connection, input);
    if(null != retQueryObj.err) {
      retGetConnObj.connection.rollback();
      callback(retGetConnObj.err, null, null);
      return;
    }

    retGetConnObj.connection.commit();
    retGetConnObj.connection.release();

    callback(null, retQueryObj.rows, retQueryObj.fields);
  }

  private getConnection(): Promise<ReturnGetConnection> {
    return new Promise((resolve) => {
      this.poolConnection!.getConnection((err, connection) => {
        resolve({
          err: err,
          connection: connection
        });
      });
    })
  }

  private query(connection: mysql.PoolConnection, input: QueryParam) : Promise<ReturnQuery> {
    return new Promise((resolve) => {
      connection.query(input.query, input.values, (err, rows, fields) => {
        resolve({
          err: err,
          rows: rows,
          fields: fields,
        });
      });
    });
  }

  private beginTransaction(connection: mysql.PoolConnection): Promise<ReturnTransaction> {
    return new Promise((resolve) => {
      connection.beginTransaction((err) => {
        resolve(err);
      });
    });
  }
}