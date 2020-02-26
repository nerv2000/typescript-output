import redis, { RedisClient, ClientOpts, Multi } from 'redis';
import { resolve } from 'dns';
import { rejects } from 'assert';

namespace libRedis {
  type PromiseReject = (error: unknown) => void;

  export interface ZrevrangeReturnObject {
    member: string
    , score: number
  }

  export class Redis {
    private client! : RedisClient;

    // client 객체 생성 체크
    private checkClient(reject: PromiseReject): boolean {
      if(null == this.client) {
        reject(new Error('not init redis'));
        return false;
      }
      return true;
    }

    // redis client 생성
    public createRedis(option : ClientOpts): boolean{
      if(undefined != this.client) {
        return false;
      }

      this.client = redis.createClient(option);
      return true;
    }

    // client 리턴
    public getClient() : RedisClient {
      return this.client;
    }

    // redis 멀티
    public getMulti() : Multi {
      return this.client.multi();
    }

    // redis 멀티 실행
    public multi_exe(multi: Multi): Promise<any[]> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        multi.exec((err, results) => {
          if(null != err) {
            reject(err);
            return;
          }
          resolve(results);
        });
      });
    }

    // redis 멀티 실행 (트랜잭션 안함)
    public multi_exe_atomic(multi: Multi): Promise<any[]> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        multi.exec_atomic((err, results) => {
          if(null != err) {
            reject(err);
            return;
          }
          resolve(results);
        });
      });
    }

    // watch (이거 쓸때는 멀티를 꼭 쓸것..)
    public watch(mainKeys: (string|string[])): Promise<void> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.watch(mainKeys, (err) => {
          if(null != err) {
            reject(err);
            return;
          }

          resolve();
        });
      });
    }

    // 메인키 삭제
    public del(mainKey: string | string[]): Promise<number> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.del(mainKey, (err, delCnt) => {
          if(null != err) {
            reject(err);
            return;
          }
          resolve(delCnt);
        });
      });
    }

    // 메인키 존재여부
    public exists(mainKey: string | string[]): Promise<number> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.exists(mainKey, (err, resultCnt) => {
          if(null != err) {
            reject(err);
            return;
          }
          resolve(resultCnt);
        });
      });
    }

    // 메인키 개수 확인
    public llen(mainKey: string): Promise<number> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.llen(mainKey, (err, count) => {
          if(null != err) {
            reject(err);
            return;
          }
          resolve(count);
        });
      });
    }

    // hash 쓰기 or 수정
    public hmset(mainKey: string, values: (string | number)[] ): Promise<void> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        if( 0 != (values.length % 2)) {
          reject('hmset data fail');
          return;
        }

        this.client.hmset(mainKey, values, (err) => {
          if(undefined != err) {
            reject(err);
            return;
          }

          resolve();
        });
      });
    }

    // hash 안에 모든 키값 읽어오기
    public hgetall(mainKey: string): Promise<{ [key: string]: string }> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.hgetall(mainKey, (err, results) =>{
          if(null != err) {
            reject(err);
            return;
          }

          resolve(results);
        });
      });
    }

    // hash 안에 서브키 값 읽어오기
    public hmget(mainKey: string, subKey: string | string[]): Promise<string[]> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.hmget(mainKey, subKey, (err, results) =>{
          if(null != err) {
            reject(err);
            return;
          }

          resolve(results);
        });
      });
    }

    // hash 안에 서브키 삭제
    public hmdel(mainKey: string, subKey: string | string[]): Promise<number> {
      return new Promise((resolve, reject) =>{
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.hdel(mainKey, subKey, (err, deleteCnt) => {
          if(null != err) {
            reject(err);
            return;
          }

          resolve(deleteCnt);
        });
      });

    }

    // hash 안에 서브키 존재 여부 확인
    public hexists(mainKey: string, subKey: string): Promise<boolean> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.hexists(mainKey, subKey, (err, result) => {
          if(null != err) {
            reject(err);
            return;
          }

          resolve(Boolean(result));
        });
      });
    }

    // sorted set - 입력/수정
    public zadd(mainKey: string, values: (string | number)[] ): Promise<void> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.zadd(mainKey, values, (err) => {
          if(undefined != err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    }

    // sorted set - 메인키에 들어있는 member 갯수
    public zcard(mainKey: string): Promise<number> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.zcard(mainKey, (err, count) => {
          if(null != err) {
            reject(err);
            return;
          }
          resolve(count);
        });
      });
    }

    // sorted set - 높은 score로 지정된 범위의 member 읽어오기 (id, score 모두);
    public zrevrange(mainKey: string, startNo?: number, endNo?: number, option?: string): Promise<Array<ZrevrangeReturnObject>> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        if("undefined" == typeof(startNo)) {
          startNo = 0
        }
        if("undefined" == typeof(endNo)) {
          endNo = -1;
        }
        if("undefined" == typeof(option)) {
          option = 'withscores';
        }

        this.client.zrevrange(mainKey, startNo, endNo, option, (err, members) => {
          if(null != err) {
            reject(err);
            return;
          }

          let datas: ZrevrangeReturnObject[] = new Array;
          for(let i=0; i < members.length; i=i+2) {
            datas.push({ member: members[i], score: Number(members[i+1]) })
          }

          resolve(datas);
        });
      });
    }

    // sorted set - 높은 score로 정렬해서 member를 지정해서 reverse rank(index)를 조회
    public zrevrank(mainKey: string, member: string): Promise<number | null> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.zrevrank(mainKey, member, (err, rankIdx) => {
          if(null != err) {
            reject(err);
            return;
          }

          resolve(rankIdx);
        });
      });
    }

    // sorted set - member로 score 점수를 가지고 온다.
    public zscore(mainKey: string, member: string): Promise<string | null> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.zscore(mainKey, member, (err, score) =>{
          if(null != err) {
            reject(err);
            return;
          }

          resolve(score);
        });
      });
    }

    // sorted set - member로 삭제
    public zrem(mainKey: string, member: string| string[]) : Promise<number> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.zrem(mainKey, member, (err, deleteCnt) =>{
          if(null != err) {
            reject(err);
            return;
          }

          resolve(deleteCnt);
        });
      });
    }

    // sorted set - score 점수 범위에 있는 모든 member 가지고 오기
    public zrevrangebyscore(mainKey: string, min: string|number, max: string|number): Promise<string[]> {
      return new Promise((resolve, reject) => {
        if(false == this.checkClient(reject)) {
          return;
        }

        this.client.zrevrangebyscore(mainKey, min, max, 'LIMIT', 0, 1, (err, members) =>{
          if(null != err) {
            reject(err);
            return;
          }

          resolve(members);
        });
      });
    }
  }
}

export = libRedis;
