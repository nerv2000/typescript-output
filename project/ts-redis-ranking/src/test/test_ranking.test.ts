import * as config from '../config';
import ModuleRanking,
{
  InputRankingSameData
  , OutputRankingSameData
  , InputRankingTimeData
  , OutputRankingTimeData
}
from '../modules/ranking'

///////////////////////////////////////////////////////////////////////////////////////////

const rankingSame = ModuleRanking.RankingSame;
describe('=== Ranking 공동 점수 처리', () => {
  test('1. 초기 세팅 확인', async () => {
    let retval = rankingSame.getInstance().init(config.host, config.port, config.db, config.password);
    expect(retval).toBe(true);

    let datas : InputRankingSameData[] = new Array();
    datas.push({usn: 'A', score: 100});
    datas.push({usn: 'B', score: 100})
    datas.push({usn: 'C', score: 99});
    datas.push({usn: 'D', score: 98});
    datas.push({usn: 'E', score: 98});

    // 데이터 넣기
    await rankingSame.getInstance().initRankingData(datas);

    // 데이터 확인
    let totalRankingDatas: OutputRankingSameData[] = await rankingSame.getInstance().getTopRankingData(100);
    expect(totalRankingDatas.length).toBe(datas.length);
  });

  test('2. B 점수 200으로 변경후 1등인지 확인', async () => {
    await rankingSame.getInstance().addRankingData({usn: 'B', score: 200});

    let totalRankingDatas: OutputRankingSameData[] = await rankingSame.getInstance().getTopRankingData(100);

    expect(totalRankingDatas[0].rankNo).toBe(1);
    expect(totalRankingDatas[0].usn).toBe('B');
    expect(totalRankingDatas[0].score).toBe(200);
  });

  test('3. F,G 추가후 순위 맞는지 확인', async () => {
    await rankingSame.getInstance().addRankingData({usn: 'F', score: 99});
    await rankingSame.getInstance().addRankingData({usn: 'G', score: 90});

    let totalRankingDatas = await rankingSame.getInstance().getTopRankingData(100);

    let f_rankingData = await rankingSame.getInstance().getMyRankingData('F');
    expect(f_rankingData.rankNo).toBe(totalRankingDatas.find( elem => elem.usn === 'F')?.rankNo);

    let g_rankingData = await rankingSame.getInstance().getMyRankingData('G');
    expect(g_rankingData.rankNo).toBe(totalRankingDatas.find( elem => elem.usn === 'G')?.rankNo);
  });

  test('4. F 위아래 순위 정보 확인', async () => {
    let totalRankingDatas = await rankingSame.getInstance().getTopRankingData(100);
    let rangeDatas = await rankingSame.getInstance().getMyRankingRange('F', 1);

    rangeDatas.forEach( rangeElem => {
      expect(rangeElem.rankNo).toBe(totalRankingDatas.find(totalElem => totalElem.usn === rangeElem.usn)?.rankNo);
    })
  });
});

const rankingTime = ModuleRanking.RankingTime;
describe('=== Ranking 시간으로 중복 안되게 처리', () => {
  test('1. 초기 세팅 확인', async () => {
    let retval = rankingTime.getInstance().init(config.host, config.port, config.db, config.password);
    expect(retval).toBe(true);

    // 데이터 넣기
    let datas : InputRankingTimeData[] = new Array();
    datas.push({usn: 'A', score: 100, updateTime: new Date('2020-01-22 10:00:00.000')});
    datas.push({usn: 'B', score: 100, updateTime: new Date('2020-01-22 9:00:00.000')});
    datas.push({usn: 'C', score: 100, updateTime: new Date('2020-01-22 11:00:00.000')});

    await rankingTime.getInstance().initRankingData(datas);

    let totalRankingDatas: OutputRankingTimeData[] = await rankingTime.getInstance().getTopRankingData(100);
    expect(totalRankingDatas.length).toBe(datas.length);

    let rankingUser: string[] = [ 'B', 'A', 'C' ];
    for(let i=0; i < totalRankingDatas.length; i++) {
      expect(totalRankingDatas[i].rankNo).toBe((i+1));
      expect(totalRankingDatas[i].usn).toBe(rankingUser[i]);
    }
  });

  test('2. B 업데이트 시간 변경후 랭킹 확인', async () => {
    await rankingTime.getInstance().addRankingData({
      usn: 'B'
      , score: 100
      , updateTime: new Date('2020-01-22 12:00:00.000')
    });

    let totalRankingDatas: OutputRankingTimeData[] = await rankingTime.getInstance().getTopRankingData(100);
    let b_RankingData: OutputRankingTimeData = await rankingTime.getInstance().getMyRankingData('B');

    expect(b_RankingData.rankNo).toBe(totalRankingDatas.find(elem => elem.usn === 'B')?.rankNo);
  });

  test('3. E,F 추가후 C 위아래 랭킹 정보 확인', async () => {
    await rankingTime.getInstance().addRankingData({
      usn: 'E'
      , score: 200
      , updateTime: new Date('2020-01-22 12:00:01.000')
    });

    await rankingTime.getInstance().addRankingData({
      usn: 'F'
      , score: 50
      , updateTime: new Date('2020-01-22 12:00:03.000')
    });

    let totalRankingDatas: OutputRankingTimeData[] = await rankingTime.getInstance().getTopRankingData(100);
    let rangeDatas: OutputRankingTimeData[] = await rankingTime.getInstance().getMyRankingRange('C', 1);

    rangeDatas.forEach( rangeElem => {
      expect(rangeElem.rankNo).toBe(totalRankingDatas.find(totalElem => totalElem.usn === rangeElem.usn)?.rankNo);
    })
  });
});