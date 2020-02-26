import swaggerJSDoc from 'swagger-jsdoc';

let swaggerDefinition: swaggerJSDoc.SwaggerDefinition = {
  info: {
    title: 'ts-account',
    version: '1.0.0',
    description: '기본 로그인 구조 테스트'
  },
  host: 'localhost',
  basePath: '/',
}

const options: swaggerJSDoc.Options = {
  swaggerDefinition: swaggerDefinition,
  apis: [
    './src/routers/*.ts',
    './yaml/*.yaml'
  ]
}

export default class SwaggerOption {
  private _swaggerJSDoc: object;
  constructor(port: number) {
    swaggerDefinition.host = 'localhost:' + port

    this._swaggerJSDoc = swaggerJSDoc(options);
  }

  get swaggerJSDoc() {
    return this._swaggerJSDoc;
  }
}

