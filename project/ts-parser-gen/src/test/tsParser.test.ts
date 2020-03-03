import TsParserConfig from '../modules/parserConfig';
import TsParser from '../modules/parser';

let ppConfig = new TsParserConfig('./');
let parser = new TsParser(ppConfig.config);

beforeAll(async () => {
  // 일단 데이터 로드 부터....
  await parser.loadData();
})

describe('파싱 기본 테스트', () => {
  test('데이터 load 체크', (done) => {
    // 로그된 객체 확인
    // enum - 4개
    // interface - 8개
    expect(parser.enums.length).toBe(4);
    expect(parser.interfaces.length).toBe(8);

    done();
  });
});

describe('enum 데이터 확인', () => {
  test('EErrorCode', (done) => {
    /*
    // 에러코드
    export enum EErrorCode {
      success = 0,  // 성공
      fail = -1,    // 실패          

      loginFail = 1000,   // 로그인 실패                   
      loginDuplicate,     // 중복 로그인                  
    }
    */
    let data = parser.enums[0];
    expect(data.name).toBe('EErrorCode');
    expect(data.description).toBe('에러코드');
    expect(data.properties.length).toBe(4);

    let propertie;
    propertie = data.properties[0];
    expect(propertie.enumerator).toBe('success');
    expect(propertie.constexpr).toBe(0);
    expect(propertie.description).toBe('성공');

    propertie = data.properties[1];
    expect(propertie.enumerator).toBe('fail');
    expect(propertie.constexpr).toBe(-1);
    expect(propertie.description).toBe('실패');

    propertie = data.properties[2];
    expect(propertie.enumerator).toBe('loginFail');
    expect(propertie.constexpr).toBe(1000);
    expect(propertie.description).toBe('로그인 실패');

    propertie = data.properties[3];
    expect(propertie.enumerator).toBe('loginDuplicate');
    expect(propertie.constexpr).toBe(undefined);
    expect(propertie.description).toBe('중복 로그인');

    done();
  });

  test('EETest', (done) => {

    // /**
    // * hello
    // * world
    // */
    // export            enum                     EETest
    // {
    //   TEST1 =                   10             ,
    //   TEST2             = 20                     ,   // 설명은 필요 없어...
    //   TEST3 = 30 ,
    //   TEST4                   
    // }

    let data = parser.enums[1];
    expect(data.name).toBe('EETest');
    expect(data.description).toBe('hello world');
    expect(data.properties.length).toBe(4);

    let propertie;
    propertie = data.properties[0];
    expect(propertie.enumerator).toBe('TEST1');
    expect(propertie.constexpr).toBe(10);
    expect(propertie.description).toBe(undefined);

    propertie = data.properties[1];
    expect(propertie.enumerator).toBe('TEST2');
    expect(propertie.constexpr).toBe(20);
    expect(propertie.description).toBe('설명은 필요 없어...');

    propertie = data.properties[2];
    expect(propertie.enumerator).toBe('TEST3');
    expect(propertie.constexpr).toBe(30);
    expect(propertie.description).toBe(undefined);

    propertie = data.properties[3];
    expect(propertie.enumerator).toBe('TEST4');
    expect(propertie.constexpr).toBe(undefined);
    expect(propertie.description).toBe(undefined);

    done();
  });

  test('ENextTest', (done) => {
    // /**
    //  * @description 넥스트 테스트 
    //  * 코드
    //  * @var TEST1 - 뭐야 이거  
    //  */
    // export enum ENextTest {
    //   // 여기도 주석을 넣으면...
    //   TEST1 = 0,
    //   TEST2,
    // } 

    let data = parser.enums[2];
    expect(data.name).toBe('ENextTest');
    expect(data.description).toBe('넥스트 테스트 코드');
    expect(data.properties.length).toBe(2);

    let propertie;
    propertie = data.properties[0];
    expect(propertie.enumerator).toBe('TEST1');
    expect(propertie.constexpr).toBe(0);
    expect(propertie.description).toBe(undefined);

    propertie = data.properties[1];
    expect(propertie.enumerator).toBe('TEST2');
    expect(propertie.constexpr).toBe(undefined);
    expect(propertie.description).toBe(undefined);

    done();
  });

  test('ENormal', (done) => {
    // enum ENormal {
    //   VAL1,
    //   VAL2,
    // }

    let data = parser.enums[3];
    expect(data.name).toBe('ENormal');
    expect(data.description).toBe(undefined);
    expect(data.properties.length).toBe(2);

    let propertie;
    propertie = data.properties[0];
    expect(propertie.enumerator).toBe('VAL1');
    expect(propertie.constexpr).toBe(undefined);
    expect(propertie.description).toBe(undefined);

    propertie = data.properties[1];
    expect(propertie.enumerator).toBe('VAL2');
    expect(propertie.constexpr).toBe(undefined);
    expect(propertie.description).toBe(undefined);

    done();
  });
});

describe('interface 데이터 확인', () => {
  test('ResCommon', (done) => {
    /*
    export interface ResCommon               
    {
      errorCode            :               EErrorCode
    }
    */
    let data = parser.interfaces[0];
    expect(data.name).toBe('ResCommon');
    expect(data.description).toBe('test');
    expect(data.properties.length).toBe(1);

    let propertie;
    propertie = data.properties[0];
    expect(propertie.name).toBe('errorCode');
    expect(propertie.type).toBe('EErrorCode');
    expect(propertie.description).toBe(undefined);
    expect(propertie.example).toBe(undefined);

    done();
  });

  test('ReqLogin', (done) => {
    /*
    interface ReqLogin {              
      id      : string         ,    //                  아이디          @ex                     test
      pw    : string   //        패스 워드    @ex test
    }
    */
    let data = parser.interfaces[1];
    expect(data.name).toBe('ReqLogin');
    expect(data.description).toBe(undefined);
    expect(data.properties.length).toBe(2);

    let propertie;
    propertie = data.properties[0];
    expect(propertie.name).toBe('id');
    expect(propertie.type).toBe('string');
    expect(propertie.description).toBe('아이디');
    expect(propertie.example).toBe('test');

    propertie = data.properties[1];
    expect(propertie.name).toBe('pw');
    expect(propertie.type).toBe('string');
    expect(propertie.description).toBe('패스 워드');
    expect(propertie.example).toBe('test');

    done();
  });

  test('ResLogin', (done) => {
    /*
    export interface        ResLogin             extends        ResCommon 
    {
      // 주석을 넣어 봅니다.
      accountUsn:number
    }
    */
    let data = parser.interfaces[2];
    expect(data.name).toBe('ResLogin');
    expect(data.description).toBe(undefined);
    expect(data.properties.length).toBe(2);

    let propertie;
    propertie = data.properties[0];
    expect(propertie.name).toBe('ResCommon');
    expect(propertie.type).toBe('object');
    expect(propertie.description).toBe(undefined);
    expect(propertie.example).toBe(undefined);

    propertie = data.properties[1];
    expect(propertie.name).toBe('accountUsn');
    expect(propertie.type).toBe('number');
    expect(propertie.description).toBe(undefined);
    expect(propertie.example).toBe(undefined);

    done();
  });

  test('ReqLogout', (done) => {
    /*
    interface ReqLogout {
      _testValue1: string,
      test_value2:string,
    }
    */

    let data = parser.interfaces[3];
    expect(data.name).toBe('ReqLogout');
    expect(data.description).toBe(undefined);
    expect(data.properties.length).toBe(2);

    let propertie;
    propertie = data.properties[0];
    expect(propertie.name).toBe('_testValue1');
    expect(propertie.type).toBe('string');
    expect(propertie.description).toBe(undefined);
    expect(propertie.example).toBe(undefined);

    propertie = data.properties[1];
    expect(propertie.name).toBe('test_value2');
    expect(propertie.type).toBe('string');
    expect(propertie.description).toBe(undefined);
    expect(propertie.example).toBe(undefined);

    done();
  });

  test('ResLogout', (done) => {
    /*
    interface                ResLogout 
    extends             ResCommon 
    {
    }
    */

    let data = parser.interfaces[4];
    expect(data.name).toBe('ResLogout');
    expect(data.description).toBe(undefined);
    expect(data.properties.length).toBe(1);

    let propertie;
    propertie = data.properties[0];
    expect(propertie.name).toBe('ResCommon');
    expect(propertie.type).toBe('object');
    expect(propertie.description).toBe(undefined);
    expect(propertie.example).toBe(undefined);

    done();
  });

  test('ReqUserStatus', (done) => {
    /*
    interface ReqUserStatus {
    }
    */

    let data = parser.interfaces[5];
    expect(data.name).toBe('ReqUserStatus');
    expect(data.description).toBe(undefined);
    expect(data.properties.length).toBe(0);

    done();
  });

  test('ResUserStatus', (done) => {
    /*
    interface ResUserStatus {
      id: (null | string),
      accountUsn: (null | number),
    }
    */

    let data = parser.interfaces[6];
    expect(data.name).toBe('ResUserStatus');
    expect(data.description).toBe(undefined);
    expect(data.properties.length).toBe(2);

    let propertie;
    propertie = data.properties[0];
    expect(propertie.name).toBe('id');
    expect(propertie.type).toBe('string');
    expect(propertie.description).toBe(undefined);
    expect(propertie.example).toBe(undefined);

    propertie = data.properties[1];
    expect(propertie.name).toBe('accountUsn');
    expect(propertie.type).toBe('number');
    expect(propertie.description).toBe(undefined);
    expect(propertie.example).toBe(undefined);

    done();
  });

  test('Test', (done) => {
    // /**
    //  * hello 
    //  * world
    //  */
    // interface Test {
    //   val: string,
    // }

    let data = parser.interfaces[7];
    expect(data.name).toBe('Test');
    expect(data.description).toBe('hello world');
    expect(data.properties.length).toBe(1);

    let propertie;
    propertie = data.properties[0];
    expect(propertie.name).toBe('val');
    expect(propertie.type).toBe('string');
    expect(propertie.description).toBe(undefined);
    expect(propertie.example).toBe(undefined);

    done();
  });
});