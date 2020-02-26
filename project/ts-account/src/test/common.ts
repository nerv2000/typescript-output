import e from 'express'
import request from 'supertest';
import * as packet from '@packet/packetDataStruct';
import { EErrorCode } from '@packet/errorCode';

export enum EContentType {
    text_html = 0,           // text/html
    text_xml,                // text/xml
    app_xml,                 // application/xml
    app_json,                // application/json
    app_x_www_form_urlencode // application/x-www-form-urlencode
}

const strContextType: string[] = [
  'text/html',
  'text/xml',
  'application/xml',
  'application/json',
  'application/x-www-form-urlencode',
]

let sessionCookie: (null | Array<string>) = null;

export function login(app: e.Application, data: packet.ReqLogin) : Promise<packet.ResLogin> {
  return new Promise(async (resolve) => {
    let res = await request(app)
    .post('/account/login')
    .set('context-type','application/json')
    .send(data);

    // 정상 처리인지 체크
    expect(res.status).toBe(200);

    let resData: packet.ResLogin = res.body;
    if(resData.errorCode == EErrorCode.success) {
      sessionCookie = res.header['set-cookie'].pop().split(';');
    }

    resolve(resData);
  });
}

export function urlGet(app: e.Application, url: string, data: any, contextType?: EContentType): Promise<any> {
  return new Promise(async (resolve) => {
    let req = request(app)
    .get(url)
    .set('Cookie', sessionCookie!)
    .send(data);

    if('undefined' == typeof contextType) {
      req.set('context-type', strContextType[EContentType.app_json]);
    } else {
      req.set('context-type', strContextType[contextType])
    }

    req.end((err, res) => {
      expect(err).toBeNull();
      expect(res.status).toBe(200);       // 정상 처리인지 체크
      resolve(res.body);
    });
  });
}

export function urlPost(app: e.Application, url: string, data: any, contextType?: EContentType): Promise<any> {
  return new Promise(async (resolve) => {
    let req = request(app)
    .post(url)
    .set('Cookie', sessionCookie!)
    .send(data);

    if('undefined' == typeof contextType) {
      req.set('context-type', strContextType[EContentType.app_json]);
    } else {
      req.set('context-type', strContextType[contextType])
    }

    req.end((err, res) => {
      expect(err).toBeNull();
      expect(res.status).toBe(200);       // 정상 처리인지 체크
      resolve(res.body);
    });
  });
}

export function urlPut(app: e.Application, url: string, data: any, contextType?: EContentType): Promise<any> {
  return new Promise(async (resolve) => {
    let req = request(app)
    .put(url)
    .set('Cookie', sessionCookie!)
    .send(data);

    if('undefined' == typeof contextType) {
      req.set('context-type', strContextType[EContentType.app_json]);
    } else {
      req.set('context-type', strContextType[contextType])
    }

    req.end((err, res) => {
      expect(err).toBeNull();
      expect(res.status).toBe(200);       // 정상 처리인지 체크
      resolve(res.body);
    });
  });
}

export function urlDelete(app: e.Application, url: string, data: any, contextType?: EContentType): Promise<any> {
  return new Promise(async (resolve) => {
    let req = request(app)
    .delete(url)
    .set('Cookie', sessionCookie!)
    .send(data);

    if('undefined' == typeof contextType) {
      req.set('context-type', strContextType[EContentType.app_json]);
    } else {
      req.set('context-type', strContextType[contextType])
    }

    req.end((err, res) => {
      expect(err).toBeNull();
      expect(res.status).toBe(200);       // 정상 처리인지 체크
      resolve(res.body);
    });
  });
}