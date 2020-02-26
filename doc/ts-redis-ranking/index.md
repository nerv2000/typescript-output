# Typescript로 redis를 이용한 ranking 코드

## 목차

[1. 시작하기 전에](#1.-시작하기-전에)

[2. 랭킹 순위 정렬 방법](#2.-랭킹-순위-정렬-방법)

[>2.1. 공동 순위로 표기한다](###2.1.-공동-순위로-표기한다)

[>2.2. 먼저 달성한 유저를 시간을 이용하여 높은 순위로 표기한다](###2.2.-먼저-달성한-유저를-시간을-이용하여-높은-순위로-표기한다)

[3. 기타](#3.-기타)

[>3.1 기본 실행](#3.1-기본-실행)

[>3.2 vscode에서 실행](#3.2-vscode에서-실행)

[>3.3 코드 파일 간단 설명](#3.3-코드-파일-간단-설명)

[>3.4 ranking module 구조 설명](#3.4-ranking-module-구조-설명)

---

## 1. 시작하기 전에

redis를 이용해서 랭킹을 만든다고 하는데 보통 sorted set의 정렬 되는 특성을 이용해서 만든다고 한다.  
sorted set의 정렬 순서는 score(중복가능)로 먼저 정렬을 하고 다음에 member(중복불가)로 정렬 한다고 한다.

이 특성 때문에 동점일 경우는 문제가 된다. 동점의 경우는 2가지 정도로 생각해 봤다.

1. 공동 순위로 표기한다.  

   >1등 - A : 100점  
   1등 - B : 100점  
   3등 - C : 99점  

2. 먼저 달성한 유저를 시간을 이용하여 높은 순위로 표기한다.

   >1등 - A : 100점 달성시간 : 2020/01/21 10:00:00.000  
   2등 - B : 100점 달성시간 : 2020/01/21 10:00:01.000  
   3등 - C : 99점 달성시간 : 2020/01/21 10:00:00.000  

둘다 redis에서 데이터를 뽑아서 가공을 해야하며  
2번 경우는 밀리초까지 같을 경우는 문제가 되지만 보통은 안된다고 보는게...

[목차로 이동](#목차)

---

## 2. 랭킹 순위 정렬 방법

### 2.1. 공동 순위로 표기한다

구현한 방법을 요약하면 아래와 같다.

* redis에 sorted set을 이용한다.
* zscore, zrevrangebyscore, zrevrank 이용해서 공동 순위를 알아낸다.

일단 기본 데이터는 아래와 같다.
> RankNo: 1 - USER: A - SCORE: 100  
RankNo: 1 - USER: B - SCORE: 100  
RankNo: 3 - USER: C - SCORE: 99  

위 상태에서 전체 랭킹을 뽑는다면 그냥 뽑아서 랭킹을 표기 할 때 값 처리를 해줘야 한다.

**ZREVRANGE Ranking 0 -1 withscores** 로 위 값을 뽑아오면 아래와 같이 나온다.
>USER: B - SCORE: 100  
USER: A - SCORE: 100  
USER: C - SCORE: 99  

데이터를 돌면서 score가 같으면 랭킹순위를 유지 하고 별도로 카운터를 세고 있다가  
score가 다르면 랭킹 번호에 별도로 세고있던 카운터 값을 더해 랭킹순위를 바꿔준다.  
아래 코드 보면 될듯

```ts
interface InData {
  member: string
  , score: number
}

interface OutData {
  rankNo: number
  , member: string
  , score: number
}

function convertFunc(inDatas: InData[], rankingStartNo: number): OutData[] {
  let outDatas : OutData[] = new Array();

  let rankingNo = rankingStartNo;   // 랭킹 순위 (1위 부터 여야 하니 값은 1이다.)
  let tempCnt = 0;                  // 별도 카운터 변수
  let prevScore = datas[0].score;   // 최초 점수를 기록

  inDatas.forEach(data => {
    if(prevScore != data.score) {   // 비교하는 점수가 다를 경우
      prevScore = data.score;
      rankingNo = rankingNo + tempCnt;
      tempCnt = 0;
    }
    tempCnt++;

    outDatas.push({
      rankNo: rankingNo
      , usn: data.member
      , score: data.score
    });
  });

  return outDatas;
}
```

redis에서 받은 값을 InData[]로 보면 되고 내부에서 랭킹을 가공하고 나오는 값을 OutData[]  
으로 보면 되고 내부에 점수가 다를 경우만 잘 보면 될꺼 같다.

내 순위를 가지고 올 때의 순서는 아래와 같다.

1. 내 스코어 점수를 가지고 온다.

2. 내 스코어 점수 중에 가장 위에 있는 member index를 가지고 온다.

3. 그 인덱스를 순위로 사용한다.

redis 함수를 이용하면 아래와 같다.

```ts
interface OutData {
  rankNo: number
  , member: string
  , score: number
}

function getMyRankingData(member: string): OutData {
  // 내 점수 확인
  let myScore = redis.zscore('ranking', usn);

  // 내점수에 가장 위에 있는 사람 가지고 오기 (LIMIT는 가장위에 1개만 가지고 오기 위해서...)
  let topMember = redis.zrevrangebyscore('ranking', myScore, myScore, 'LIMIT', 0, 1);

  // 위에서 가지고 온 사람의 index 가지고 오기
  let index = multi.zrevrank('ranking', topMember);

  let retData: OutData = {
    rankNo: (index + 1)   // index에 1을 더한 이유는 index는 0부터 시작 하기에....
    , member: member
    , score: myScore
  }
  return retData
}
```

나머지 자세한건 코드 보면 될 듯.....

[목차로 이동](#목차)

---

### 2.2. 먼저 달성한 유저를 시간을 이용하여 높은 순위로 표기한다

구현한 방법을 요약하면 아래와 같다

* redis에 있는 sorted set, hash 2개를 이용한다.
* hash에는 sorted set에 사용할 member값을 저장 한다.
* sortsd set에는 score와 hash에서 만든 member값을 사용해서 저장한다.

sorted set의 특성은 위에서 언급한데로 score가 같을 경우 member로 정렬 하는데  
이것을 이용하는 방법이다.

일단 기본 데이터는 아래와 같다.
> USER: A - SCORE: 100 - DATE: 2020/01/21 10:00:00.000  
USER: B - SCORE: 100 - DATE: 2020/01/21 09:00:00.000  
USER: C - SCORE: 100 - DATE: 2020/01/21 12:00:00.000  

위 데이터를 원하는 조건데로 나온다면 아래와 같이 나와야 한다.
> USER: B - SCORE: 100  
USER: A - SCORE: 100  
USER: C - SCORE: 100  

하지만 redis에서 **ZREVRANGE Ranking 0 -1 withscores** 해서
값을 가지고 오면 아래와 같이 출력 된다.
>MEMBER: C - SCORE: 100  
MEMBER: B - SCORE: 100  
MEMBER: A - SCORE: 100  

위에서 이야기 한데로 score를 우선 정렬 후 member를 정렬 했기 때문이다.

그래서 member에 시간값을 넣어서 정렬 하게 하면 되지 않을까 라는 생각을 했다.

일단 날짜를 숫자로 바꾸는건 **Date.getTime()** 함수를 이용하면 된다.

숫자로 바꾸더라도 가장 최근 날짜의 숫자가 작기 때문에 한번 뒤집어 줘야 한다.

Date가 가질수 있는 최대값은 구글링 해보니 **8640000000000000** 인거 같다.  
(년도로 표기하면 275760년 몇월... 뭐 더 작은 값을 줘도 관계는 없을꺼 같다.)

아무튼 저 값을 나온 날짜 값으로 빼주고 member를 아래와 같이 만들었다.

> 시간값 : 유저이름

sorted set에 만든 값을 넣고 다시 ZREVRANGE를 하면  
아래와 같이 우리가 원하는 값이 나왔다.

>MEMBER: 8638420435200000:B -> SCORE: 100  
MEMBER: 8638420431600000:A -> SCORE: 100  
MEMBER: 8638420424400000:C -> SCORE: 100  

하지만 유저만 알아서는 SCORE 값을 갱신 할 수 없기에  
member값을 hash에 저장해서 처리하는 하도록 했다.

redis에 데이터가 들어간 구조를 보면 아래와 같다.

* **rankingMember - hash - sorted set에 사용 하는 member 값을 저장**

  >KEY: A -> VALUE: 8638420431600000:A  
  KEY: B -> VALUE: 8638420435200000:B  
  KEY: C -> VALUE: 8638420424400000:C  

* **ranking - sorted set - 실재 랭킹 점수 기록**
  > MEMBER: 8638420424400000:C -> SCORE: 100  
  MEMBER: 8638420431600000:A -> SCORE: 100  
  MEMBER: 8638420435200000:B -> SCORE: 100  

이제 지켜야 할 절차는 아래와 같다.

* 처음 랭킹 점수를 기록 할 경우
  1. member에 사용 할 키를 만들어 hash에 우선 등록
  2. 위에서 만든 키로 sorted set 테이블에 member와 score를 등록

* 랭킹 점수를 갱신 할 경우
  1. hash에 등록되어 있던 이전 member값을 찾아 sorted set 테이블에서 값 삭제
  2. 새로운 member키를 만들어 hash에 갱신
  3. 위에서 만든 키로 sorted set 테이블에 member와 score를 등록

순위를 가지고오는 것은 index를 이용하면 되고 index에 1을 더하면 된다.  
자세한건 코드를 보며...

[목차로 이동](#목차)

---

## 3. 기타

### 3.1 기본 실행

**실행전 src 폴더에 있는 config.ts 파일에 redis 접속 정보 넣어 줘야 함.**

일단 npm이 설치 되어있다는 가정하에 아래와 같이 실행 함 (**nodejs 설치 되어 있음 됨...**)

node module 설치

>npm install

jest 코드 실행 - src/test 폴더에 test_ranking.test.ts 파일 실행

>npm test

그냥 실행 - src 폴더에 app.ts 실행

>npm start

[목차로 이동](#목차)

### 3.2 vscode에서 실행

코드 디버깅을 하기 위해서는 .vscode 폴더에 launch.json, tasks.json 파일을 생성해야 함.

참고로 vscode에 한글팩을 설치한 상태임..

launch.json

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "프로그램 시작",
      "program": "${workspaceFolder}/src/app.ts",
      "outFiles": [
        "${workspaceFolder}/out/**/*.js"
      ],
      "preLaunchTask": "tsc: 빌드 - tsconfig.json"
    }
  ]
}
```

tasks.json

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "typescript",
      "tsconfig": "tsconfig.json",
      "problemMatcher": [
        "$tsc"
      ],
      "group": {
        "kind": "build",
        "isDefault": true
      }
    }
  ]
}
```

[목차로 이동](#목차)

### 3.3 코드 파일 간단 설명

* **src 폴더**  
  app.ts - main 함수  
  config.ts - redis 접속 정보 세팅  

* **src/lib 폴더**  
  dataStr.ts - Date를 format 형태로 뽑기 위한 코드  
  redis.ts - nodeRedis 랩핑 코드  

* **src/modules 폴더**  
  ranking.ts - 랭킹 처리를 하는 코드  

* **src/test 폴더**  
  test_ranking.test.ts - jest로 검증 하기 위한 코드  
  test_ranking.ts - app에서 실행 하기 위한 코드  

[목차로 이동](#목차)

### 3.4 ranking module 구조 설명

class RankingParent를 상속 받은 class RankingSame(공동순위), class RankingTime(시간구분) 으로 구성 되어있음

**interface RankingCommonFunc**는 RankingSame, RankingTime 에서 공동으로 사용하는 함수를 정의 해둠...

RankingCommonFunc에 있는 함수 설명
>initRankingData() - 최초 redis에 데이터 넣기  
addRankingData() - 랭킹 데이터 추가 or 갱신  
getMyRankingData() - 내 랭킹 정보 가지고 오기 (순위, 점수)  
getMyRankingRange() - 내 랭킹 기준 범위에 있는 랭킹 데이터 가지고 오기  
getTopRankingData() - 탑 렝킹 가지고 오기 (1위 부터 지정된 개수 만큼)  

[목차로 이동](#목차)
