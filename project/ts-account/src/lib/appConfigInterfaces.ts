/**
 * 기본 설정
 */
export interface IDefaultConfig {
  /**
   * session 암호
   */
  secret: string,
  /**
   * 서버 port 번호
   */
  port: number,
  /**
   * 만료 시간
   */
  maxAge: number,
}

/**
 * redis 접속 정보
 */
export interface IRedisConfig {
  host: string,
  port: number,
  db: number,
  password?: string,
}

/**
 * mysql 접속 정보
 */
export interface IMysqlConfig {
  host: string,
  port: number,
  user: string,
  password: string,
  database: string,
  connectionLimit?: number,
}

/**
 * 기본 서버 config
 */
export interface IConfig extends IDefaultConfig {
  /**
   * session redis stroe 접속 세팅값
   */
  redisStore: IRedisConfig,
  /**
   * mysql 접속 세팅값
   */
  mysqlPool: IMysqlConfig
}