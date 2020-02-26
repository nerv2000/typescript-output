import libRedis, { ZrevrangeReturnObject } from '../lib/redis';
import * as dataStr from '../lib/dateStr'
import { resolve } from 'dns';

namespace ModuleRanking {
  type PromiseReject = (error: unknown) => void;

  class RankingParent {
    protected _rankMainKey: string = '';
    protected _rankMemberMainKey: string = '';
    protected _redis: libRedis.Redis = new libRedis.Redis();
    protected _isInit: boolean = false;

    /**
     * 초기화 함수
     * @param _host redis 접속 주소
     * @param _port redis 접속 포트
     * @param _db redis 접속 DB
     * @param [_password] redis 패스워드 (없음 안써도 됨)
     * @returns true if init (처리 결과)
     */
    public init(_host: string, _port: number, _db: number, _password?: string): boolean {
      if(true == this._isInit) {
        return false;
      }

      this._redis.createRedis({
        host: _host
        , port: _port
        , db: _db
        , password: _password
      });

      this._isInit = true;

      return true;
    }

    protected isInit(reject: PromiseReject): boolean {
      if(false == this._isInit) {
        reject(new Error('not init Ranking'));
        return false;
      }
      return true;
    }

    /**
     * 현재 랭킹데이터 개수 가지고 오기
     * @returns 현재 redis에 들어있는 데이터 개수
     */
    public getTotalRankingData(): Promise<number> {
      return new Promise(async (resolve, reject) => {
        if(false == this.isInit(reject)) {
          return;
        }

        let totalCount = await this._redis.zcard(this._rankMainKey);
        resolve(totalCount);
      });
    }
  }

  interface RankingCommonFunc<T_IN, T_OUT> {
    /**
     * 최초 redis에 데이터 넣기
     * @param datas 입력 데이터
     * @param isRedisDataDelete 기존 데이터 삭제 여부
     */
    initRankingData(datas: T_IN[], isRedisDataDelete: boolean): Promise<void>,
    /**
     * 랭킹 데이터 추가 or 갱신
     * @param data 입력 데이터
     */
    addRankingData(data: T_IN): Promise<void>,
    /**
     * 내 랭킹 정보 가지고 오기 (순위, 점수)
     * @param usn 유저번호
     * @returns my ranking data
     */
    getMyRankingData(usn: string): Promise<T_OUT>,
    /**
     * 내 랭킹 기준 범위에 있는 랭킹 데이터 가지고 오기
     * @param usn 유저번호
     * @param range 범위
     * @returns my ranking range data
     */
    getMyRankingRange(usn: string, range: number): Promise<T_OUT[]>,
    /**
     * 탑 렝킹 가지고 오기 (1위 부터 지정된 개수 만큼)
     * @param selectDataCnt 가지고올 개수
     * @returns top ranking data
     */
    getTopRankingData(selectDataCnt: number): Promise<T_OUT[]>
  }

  ////////////////////////////////////////////////////////////////////////////////

  /**
   * 공동 랭킹에서 입력할 때 사용 하는 interface
   */
  export interface InputRankingSameData {
    usn: string
    , score: number
  }

  /**
   * 공동 랭킹에서 출력할 때 사용 하는 interface
   */
  export interface OutputRankingSameData {
    rankNo: number
    , usn: string
    , score: number
  }

  /**
   * 공동 랭킹 처리 class (singleton 사용)
   */
  export class RankingSame extends RankingParent implements RankingCommonFunc<InputRankingSameData, OutputRankingSameData> {
    private static _instance: RankingSame;

    private constructor() {
      super();
      this._rankMainKey = 'rankingSame';
    }

    public static getInstance() {
      if (!RankingSame._instance) {
        RankingSame._instance = new RankingSame();
      }

      return RankingSame._instance;
    }

    private convertOutputUserRankInfoArray(datas: ZrevrangeReturnObject[], rankingNo: number): OutputRankingSameData[] {
      let retArray : OutputRankingSameData[] = new Array();
      let tempCnt = 0;
      let prevScore = datas[0].score;

      datas.forEach(data => {
        if(prevScore != data.score) {
          prevScore = data.score;
          rankingNo = rankingNo + tempCnt;
          tempCnt = 0;
        }
        tempCnt++;

        let value: OutputRankingSameData = {
          rankNo: rankingNo
          , usn: data.member
          , score: data.score
        }
        retArray.push(value);
      });

      return retArray;
    }

    public initRankingData(datas: InputRankingSameData[], isRedisDataDelete: boolean = true): Promise<void> {
      return new Promise(async (resolve, reject) => {
        if(false == this.isInit(reject)) {
          return;
        }

        // redis에 들어있는 기존 데이터 삭제 처리 여부
        if(true == isRedisDataDelete) {
          let resultCnt = await this._redis.exists([this._rankMainKey]);
          if(0 != resultCnt) {
            await this._redis.del([this._rankMainKey]);
          }
        }

        // 데이터 입력
        let multi = this._redis.getMulti();

        datas.forEach(data => {
          multi.zadd(this._rankMainKey, data.score, data.usn);
        })

        await this._redis.multi_exe_atomic(multi);

        // 완료 처리
        resolve();
      });
    }

    public addRankingData(data: InputRankingSameData): Promise<void> {
      return new Promise(async (resolve, reject) => {
        if(false == this.isInit(reject)) {
          return;
        }

        this._redis.getClient().zadd(this._rankMainKey, data.score, data.usn, (err, result) => {
          if(null != err) {
            reject(err);
            return;
          }

          resolve();
        });
      });
    }

    public getMyRankingData(usn: string): Promise<OutputRankingSameData> {
      return new Promise(async (resolve, reject) => {
        if(false == this.isInit(reject)) {
          return;
        }

        // watch 실행
        await this._redis.watch(this._rankMainKey);

        // 내 점수 확인
        let myScore = await this._redis.zscore(this._rankMainKey, usn);
        if(null == myScore) {
          reject(new Error(`[getMyRankingData] not found score - usn: ${usn}`));
          return;
        }

        //  내점수에 있는 모든 사람 읽어오기
        let members = await this._redis.zrevrangebyscore(this._rankMainKey, myScore, myScore);
        if(0 >= members.length) {
          reject(new Error(`[getMyRankingData] not found score memebers - usn: ${usn}`));
          return;
        }

        // 가장 위에 있는 사람의 idx 가지고 오기
        let multi = this._redis.getMulti();
        multi.zrevrank(this._rankMainKey, members[0]);
        let multiResults = await this._redis.multi_exe(multi);
        if(0 >= multiResults.length) {
          reject(new Error(`[getMyRankingData] not found rank idx - usn: ${usn}`));
          return;
        }

        let retData: OutputRankingSameData = {
          rankNo: (multiResults[0] + 1)
          , usn: usn
          , score: Number(myScore)
        }
        resolve(retData);
      });
    }

    public getMyRankingRange(usn: string, range: number): Promise<OutputRankingSameData[]> {
      return new Promise(async (resolve, reject) => {
        if(false == this.isInit(reject)) {
          return;
        }

        // watch 실행
        await this._redis.watch(this._rankMainKey);

        // 내 랭킹 인덱스 가지고 오기
        let rankingIdx = await this._redis.zrevrank(this._rankMainKey, usn);
        if(null == rankingIdx) {
          reject(new Error("[getMyRankingAroundData] not found usn ranking index."))
          return;
        }

        let startNo = rankingIdx - range;
        if(0 > startNo) {
          startNo = 0;
        }
        let endNo = rankingIdx + range;

        // 내 주변 랭킹 가지고 오기
        let rankingDatas = await this._redis.zrevrange(this._rankMainKey, startNo, endNo);
        if(0 >= rankingDatas.length) {
          reject(new Error("[getMyRankingAroundData] not found zrevrange data."))
          return;
        }

        // 가지고온 데이터에서 높은 점수의 순위 가지고 오기
        let members = await this._redis.zrevrangebyscore(this._rankMainKey, rankingDatas[0].score, rankingDatas[0].score);
        if(0 >= members.length) {
          reject(new Error('[getMyRankingAroundData] not found score memebers'));
          return;
        }

        // 가장 위에 있는 사람의 idx 가지고 오기
        let multi = this._redis.getMulti();
        multi.zrevrank(this._rankMainKey, members[0]);
        let multiResults = await this._redis.multi_exe(multi);
        if(0 >= multiResults.length) {
          reject(new Error('[getMyRankingAroundData] not found rank idx'));
          return;
        }

        resolve(this.convertOutputUserRankInfoArray(rankingDatas, (multiResults[0] + 1)));
      });
    }

    public getTopRankingData(selectDataCnt: number): Promise<OutputRankingSameData[]> {
      return new Promise(async (resolve, reject) => {
        if(false == this.isInit(reject)) {
          return;
        }

        let rankingDatas = await this._redis.zrevrange(this._rankMainKey, 0, (selectDataCnt - 1));
        resolve(this.convertOutputUserRankInfoArray(rankingDatas, 1));
      });
    }
  }

  ////////////////////////////////////////////////////////////////////////////////

  const MAX_DATE_VALUE = 8640000000000000;  // Date가 가질수 있는 최대값
  const MAX_DATE_VALUE_LENGTH = 16;         // Date를 숫자로 했을때 나올수 있는 자리수

  type InputRedisRankInfo = {
    usn: string
    , memberKey: string
    , score: number
  }

  /**
   * 시간으로 랭킹 유저 구분할때 입력하는 interface
   */
  export interface InputRankingTimeData {
    usn: string
    , score: number
    , updateTime: Date
  }

  /**
   * 시간으로 랭킹 유저 구분할때 출력하는 interface
   */
  export interface OutputRankingTimeData {
    rankNo: number
    , usn: string
    , score: number
    , updateTime: Date
    , strUpdateTime: string
  }

  /**
   * 시간값으로 유저랭킹이 중복 되지 않게 처리하는 class
   */
  export class RankingTime extends RankingParent implements RankingCommonFunc<InputRankingTimeData, OutputRankingTimeData> {
    private static _instance: RankingTime;

    private constructor() {
      super();
      this._rankMainKey = 'rankingTime';
      this._rankMemberMainKey = 'rankingTimeMember'
    }

    public static getInstance() {
      if (!RankingTime._instance) {
        RankingTime._instance = new RankingTime();
      }

      return RankingTime._instance;
    }

    private convertRankingMemberKey(usn: string, updateTime: Date ): string {
      let strUpdateTime = (MAX_DATE_VALUE - updateTime.getTime()).toString();
      let strLength = MAX_DATE_VALUE_LENGTH - strUpdateTime.length;

      if(0 > strLength) {
        let strAdd:string = '';
        for(let i=0; i<strLength; i++) {
          strAdd = (strAdd + '0');
        }
        strUpdateTime = strAdd + strUpdateTime;
      }

      return strUpdateTime + ':' + usn;
    }

    private convertOutputUserRankInfo(data: ZrevrangeReturnObject, rankingNo: number): OutputRankingTimeData {
      let splite = String(data.member).split(':');

      let timestamp = MAX_DATE_VALUE - Number(splite[0]);
      let updateTime = new Date(timestamp);
      let usn = splite[1];

      let retVal: OutputRankingTimeData = {
        rankNo: rankingNo
        , usn: usn
        , score: data.score
        , updateTime: updateTime
        , strUpdateTime: dataStr.DateStr.format(updateTime, 'yyyy/MM/dd HH:mm:ss.ms (local Time)')
      };

      return retVal;
    }

    private convertOutputUserRankInfoArray(datas: ZrevrangeReturnObject[], startRankingNo: number): OutputRankingTimeData[] {
      let retArray : OutputRankingTimeData[] = new Array();

      let cnt = startRankingNo;
      datas.forEach(data => {
        retArray.push(this.convertOutputUserRankInfo(data, cnt));
        cnt++;
      });

      return retArray;
    }

    private parsingRankingData(data: InputRankingTimeData): InputRedisRankInfo {
      let retValue: InputRedisRankInfo = {
        usn: data.usn
        , memberKey: this.convertRankingMemberKey(data.usn, data.updateTime)
        , score: data.score
      };

      return retValue;
    }

    public initRankingData(datas: InputRankingTimeData[], isRedisDataDelete: boolean = true): Promise<void> {
      return new Promise(async (resolve, reject) => {
        if(false == this.isInit(reject)) {
          return;
        }

        // redis에 들어있는 기존 데이터 삭제 처리 여부
        if(true == isRedisDataDelete) {
          let resultCnt = await this._redis.exists([this._rankMainKey, this._rankMemberMainKey]);
          if(0 != resultCnt) {
            await this._redis.del([this._rankMainKey, this._rankMemberMainKey]);
          }
        }

        // 데이터 입력
        let multi = this._redis.getMulti();

        datas.forEach(data => {
          let convertData = this.parsingRankingData(data);

          multi.hmset(this._rankMemberMainKey, String(convertData.usn), convertData.memberKey);
          multi.zadd(this._rankMainKey, convertData.score, convertData.memberKey);
        })

        await this._redis.multi_exe_atomic(multi);

        // 완료 처리
        resolve();
      });
    }

    public addRankingData(data: InputRankingTimeData): Promise<void> {
      return new Promise(async (resolve, reject) => {
        if(false == this.isInit(reject)) {
          return;
        }

        // 일단 이전 기록이 있는지 체크
        let prevMemberKeys = await this._redis.hmget(this._rankMemberMainKey, data.usn);

        let multi = this._redis.getMulti();

        // 이전 기록이 있으면 삭제 처리
        if(0 != prevMemberKeys.length) {
          multi.zrem(this._rankMainKey, prevMemberKeys[0]);
        }

        // 점수를 추가or갱신 해준다.
        let convertData = this.parsingRankingData(data);

        multi.hmset(this._rankMemberMainKey, String(convertData.usn), convertData.memberKey);
        multi.zadd(this._rankMainKey, convertData.score, convertData.memberKey);

        await this._redis.multi_exe(multi);

        // 완료
        resolve();
      });
    }

    public getMyRankingData(usn: string): Promise<OutputRankingTimeData> {
      return new Promise(async (resolve, reject) => {
        if(false == this.isInit(reject)) {
          return;
        }

        let memberKeys = await this._redis.hmget(this._rankMemberMainKey, usn);
        if(0 == memberKeys.length) {
          return Promise.reject(new Error('[getMyRankingData] not found rank Member MainKey'));
        }

        let multi = this._redis.getMulti();

        multi.zrevrank(this._rankMainKey, memberKeys[0]);
        multi.zscore(this._rankMainKey, memberKeys[0]);

        let results = await this._redis.multi_exe(multi);
        if(2 != results.length) {
          return Promise.reject(new Error('[getMyRankingData] data select fail.'));
        }

        let rankingData: ZrevrangeReturnObject = {
          member: memberKeys[0]
          , score: results[1]
        };

        resolve(this.convertOutputUserRankInfo(rankingData, (results[0] + 1)));
      });
    }

    public getMyRankingRange(usn: string, range:number): Promise<OutputRankingTimeData[]> {
      return new Promise(async (resolve, reject) => {
        if(false == this.isInit(reject)) {
          return;
        }

        await this._redis.watch([this._rankMainKey, this._rankMemberMainKey]);

        let memberKeys = await this._redis.hmget(this._rankMemberMainKey, usn);
        if(0 == memberKeys.length) {
          return Promise.reject(new Error('[getMyRankingData] not found rank Member MainKey'));
        }

        let rankingIdx = await this._redis.zrevrank(this._rankMainKey, memberKeys[0]);
        if(null == rankingIdx) {
          return Promise.reject(new Error('[getMyRankingData] not found rank data'));
        }

        let startIdx = rankingIdx - range;
        if(0 > startIdx) {
          startIdx = 0;
        }
        let endIdx = rankingIdx + range;

        let rankingDatas = await this._redis.zrevrange(this._rankMainKey, startIdx, endIdx);

        resolve(this.convertOutputUserRankInfoArray(rankingDatas, (startIdx + 1)));
      });
    }

    public getTopRankingData(selectDataCnt: number): Promise<OutputRankingTimeData[]> {
      return new Promise(async (resolve, reject) => {
        if(false == this.isInit(reject)) {
          return;
        }

        let rankingDatas = await this._redis.zrevrange(this._rankMainKey, 0, (selectDataCnt - 1));

        resolve(this.convertOutputUserRankInfoArray(rankingDatas, 1));
      });
    }
  }
}

export = ModuleRanking