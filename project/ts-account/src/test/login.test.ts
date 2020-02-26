import * as common from './common';
import AppConfig from '@modules/appConfig';
import AppStart from '@modules/appStart';
import { EErrorCode } from '@packet/errorCode';
import * as packet from '@packet/packetDataStruct';
import { Server } from 'http';

const appConfig = new AppConfig();
const appStart = new AppStart(appConfig.config!);
let server: Server;

beforeAll(async () => {
  server = await appStart.listen(appConfig.config!.port);
});

afterAll(() => {
  server.close();
});

describe('로그인 테스트', () => {
  test('없는 계정', async (done) => {
    let reqData: packet.ReqLogin = {
      id: 'easdj123',
      pw: 'easdj123'
    }

    let resData: packet.ResLogin = await common.login(appStart.app, reqData);
    expect(resData.errorCode).toBe(EErrorCode.loginFail);

    done();
  });

  test('정상 로그인/로그아웃', async (done) => {
    let reqData: packet.ReqLogin = {
      id: 'test',
      pw: 'test'
    }

    // 로그인
    let resLoginData: packet.ResLogin = await common.login(appStart.app, reqData);
    expect(resLoginData.errorCode).toBe(EErrorCode.success);

    // 로그아웃
    let reqLogoutData: packet.ReqLogout = {};
    let resLogoutData: packet.ResLogout = await common.urlDelete(appStart.app, '/account/logout', reqLogoutData);
    expect(resLogoutData.errorCode).toBe(EErrorCode.success);

    done();
  });
});
