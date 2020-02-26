import * as controller from './user.controller';
import express from 'express';
const router = express.Router();

/** path - /account/status
 *  @swagger
 *  paths:
 *    /user/status:
 *      get:
 *        tags:
 *          - 'user'
 *        summary: '유저 로그인 상태 확인'
 *        description: ''
 *        produces:
 *        - "application/json"
 *        responses:
 *          '200':
 *            description: |
 *              error code 0 - 정상
 *              error code 1000 - 로그인 실패
 *          '400':
 *            description: '입력값이 잘못 됨'
 */
router.get('/status', controller.status);

export = router;