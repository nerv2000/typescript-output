import * as config from '../config';
import ModuleRanking,
{
  InputRankingSameData
  , OutputRankingSameData
  , InputRankingTimeData
  , OutputRankingTimeData
}
from '../modules/ranking';

const rankingSame = ModuleRanking.RankingSame;
export namespace Test_1 {
  export function main() {
    console.log('test rankingSame Test - start');

    // 테스트 코드 순차 실행
    func_start()
       .then(func_1)
       .then(func_2)
       .then(func_3)
       .then(func_4)
       .then(func_5)
       .then(func_6)
       .catch((err) => console.log(err))
       .finally(() => console.log("ranking End"));
  }

  function func_start(): Promise<InputRankingSameData[]> {
    rankingSame.getInstance().init(config.host, config.port, config.db, config.password);

    return new Promise((resolve) => {
      // 데이터 넣기
      let datas : InputRankingSameData[] = new Array();
      datas.push({usn: 'A', score: 100});
      datas.push({usn: 'B', score: 100})
      datas.push({usn: 'C', score: 99});
      datas.push({usn: 'D', score: 98});
      datas.push({usn: 'E', score: 98});

      return resolve(datas);
    });
  }

  function func_1(datas: InputRankingSameData[]) {
    return rankingSame.getInstance().initRankingData(datas);
  }

  async function func_2(): Promise<void> {
    // 2. 저장된 데이터 확인
    let outDatas: OutputRankingSameData[] = await rankingSame.getInstance().getTopRankingData(100);

    console.log(`===최초 데이터(${outDatas.length})`);
    console.log(outDatas);

    return Promise.resolve();
  }

  function func_3(): Promise<void> {
    let data : InputRankingSameData = {
      usn: 'B'
      , score: 200
    };

    return rankingSame.getInstance().addRankingData(data);
  }

  async function func_4() {
    let outDatas: OutputRankingSameData[] = await rankingSame.getInstance().getTopRankingData(100);
    console.log(`===갱신 데이터(${outDatas.length})`);
    console.log(outDatas);

    return Promise.resolve();
  }

  async function func_5() {

    await rankingSame.getInstance().addRankingData({usn: 'F', score: 99});
    await rankingSame.getInstance().addRankingData({usn: 'G', score: 99});
    console.log('F, G 추가');

    let totalRanking = await rankingSame.getInstance().getTopRankingData(100);
    console.log('전체 순위');
    console.log(totalRanking)

    let rankingData1 = await rankingSame.getInstance().getMyRankingData('F');
    console.log('F - 순위 정보');
    console.log(rankingData1);

    let rankingData2 = await rankingSame.getInstance().getMyRankingData('B');
    console.log('B - 순위 정보');
    console.log(rankingData2);

    let rankingData3 = await rankingSame.getInstance().getMyRankingData('D');
    console.log('D - 순위 정보');
    console.log(rankingData3);

    return Promise.resolve();
  }

  async function func_6() {
    let data = await rankingSame.getInstance().getMyRankingRange('F', 1);
    console.log(data);
  }
}

const rankingTime = ModuleRanking.RankingTime;
export namespace Test_2 {
  export function main() {
    console.log('test ranking Time - start');

    // 테스트 코드 순차 실행
    func_start()
      .then(func_1)
      .then(func_2)
      .then(func_3)
      .then(func_4)
      .then(func_5)
      .then(func_6)
      .catch((err) => console.log(err))
      .finally(() => console.log("ranking End"));
  }

  function func_start(): Promise<InputRankingTimeData[]> {
    rankingTime.getInstance().init(config.host, config.port, config.db, config.password);

    return new Promise((resolve) => {
      // 데이터 넣기
      let datas : InputRankingTimeData[] = new Array();
      datas.push({usn: 'A', score: 100, updateTime: new Date('2020-01-22 10:00:00.000')});
      datas.push({usn: 'B', score: 100, updateTime: new Date('2020-01-22 9:00:00.000')});
      datas.push({usn: 'C', score: 100, updateTime: new Date('2020-01-22 11:00:00.000')});

      return resolve(datas);
    });
  }

  function func_1(datas: InputRankingTimeData[]) {
    return rankingTime.getInstance().initRankingData(datas);
  }

  async function func_2(): Promise<void> {
    let outDatas: OutputRankingTimeData[] = await rankingTime.getInstance().getTopRankingData(100);

    console.log(`===최초 데이터(${outDatas.length})`);
    console.log(outDatas);

    return Promise.resolve();
  }

  function func_3(): Promise<void> {
    let data : InputRankingTimeData = {
      usn: 'B'
      , score: 100
      , updateTime: new Date('2020-01-22 12:00:00.000')
    };

    return rankingTime.getInstance().addRankingData(data);
  }

  async function func_4() {
    let outDatas: OutputRankingTimeData[] = await rankingTime.getInstance().getTopRankingData(100);
    console.log(`===갱신 데이터(${outDatas.length})`);
    console.log(outDatas);

    return Promise.resolve();
  }

  async function func_5() {
    let outData: (OutputRankingTimeData|null) = await rankingTime.getInstance().getMyRankingData('B');
    if(null == outData) {
      return Promise.reject(new Error("B_1002 not data"));
    }

    console.log(`===B 유저 랭킹 정보`);
    console.log(outData);
  }

  async function func_6() {
    let outDatas = await rankingTime.getInstance().getMyRankingRange('C', 1);
    console.log(`===C 부터 위 아래 있는 유저 랭킹 정보(${outDatas.length})`);
    console.log(outDatas);
  }
}
