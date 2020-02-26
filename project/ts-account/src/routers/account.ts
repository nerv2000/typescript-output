import * as controller from './account.controller';
import express from 'express';
const router = express.Router();

/** path - /account/login
 *  @swagger
 *  paths:
 *    /account/login:
 *      post:
 *        tags:
 *          - 'account'
 *        summary: '로그인 처리'
 *        description: ''
 *        consumes:
 *        - "application/json"
 *        produces:
 *        - "application/json"
 *        parameters:
 *        - in: "body"
 *          name: "body"
 *          required: true
 *          description: 'id, 패스워드 입력'
 *          schema:
 *            $ref: "#/definitions/ReqLogin"
 *        responses:
 *          '200':
 *            description: '정상 처리 됨'
 *            schema:
 *              $ref: "#/definitions/ResLogin"
 *          '400':
 *            description: '입력값이 잘못 됨'
 */
router.post('/login', controller.login);
/** path - /account/login
 *  @swagger
 *  paths:
 *    /account/logout:
 *      delete:
 *        tags:
 *          - 'account'
 *        summary: '로그아웃 처리 처리'
 *        description: ''
 *        consumes:
 *        - "application/json"
 *        produces:
 *        - "application/json"
 *        parameters:
 *        - in: "body"
 *          name: "body"
 *          required: true
 *          schema:
 *            $ref: "#/definitions/ReqLogout"
 *        responses:
 *          '200':
 *            description: '정상 처리 됨'
 *            schema:
 *              $ref: "#/definitions/ResLogout"
 *          '400':
 *            description: '입력값이 잘못 됨'
 */
router.delete('/logout', controller.logout);

export = router;