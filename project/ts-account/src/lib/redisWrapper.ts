import redis from 'redis';
import { IRedisConfig } from './appConfigInterfaces';

export default class RedisWrapper {
  private _redisClient: redis.RedisClient;

  constructor(options: IRedisConfig) {
    this._redisClient = redis.createClient({
      host: options.host,
      port: options.port,
      db: options.db,
      password: options.password
    });
  }

  get redisClient() {
    return this._redisClient;
  }
}