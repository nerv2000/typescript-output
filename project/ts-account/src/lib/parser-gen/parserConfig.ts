import fs from 'fs';
import JSON5 from 'json5';

const enumYamlFileName = 'enums.yaml'
const interfaceYamlFileName = "interfaces.yaml"
const configFileName = 'tsparser.json5';
const configFileData = `// 참고
// 기본 경로는 프로그램 실행 위치 입니다.
// path는 상대 경로로 넣어주면 됩니다.
{
  "readFilePath": "",                              // 파싱할 폴더 위치
  "yamlOutputPath": "/yaml",                       // ymal 파일 생성 위치
  // "yamlEnumfileName": "${enumYamlFileName}",             // enum 파싱후 생성한 yaml 파일명
  // "yamlInterfaceFileName": "${interfaceYamlFileName}"    // interface 파싱후 생성한 yaml 파일명
}
`;

export interface ITsParserFileConfig {
  readFilePath?: string,
  yamlOutputPath?: string,
  yamlEnumFileName?: string,
  yamlInterfaceFileName?: string,
}

export interface ITsParserConfig extends ITsParserFileConfig {
  rootPath: string,
}

export default class TsParserConfig {
  private _config: ITsParserConfig;

  get config() {
    return this._config;
  }

  constructor(rootPath: string) {
    let strFileConfig: string;
    let fileConfig: ITsParserFileConfig = {};

    try {
      strFileConfig = fs.readFileSync(configFileName, { encoding: 'utf-8', flag: 'r' } );
      fileConfig = JSON5.parse(strFileConfig);
    } catch(err) {
      console.log(`Error : not found ${configFileName}`);
      process.exit();
    }

    this._config = {
      rootPath: rootPath,
      readFilePath: (undefined != fileConfig.readFilePath ? fileConfig.readFilePath : ""),
      yamlOutputPath: (undefined != fileConfig.yamlOutputPath ? fileConfig.yamlOutputPath : "yaml"),
      yamlEnumFileName: (undefined != fileConfig.yamlEnumFileName ? fileConfig.yamlEnumFileName : enumYamlFileName),
      yamlInterfaceFileName: (undefined != fileConfig.yamlInterfaceFileName ? fileConfig.yamlInterfaceFileName : interfaceYamlFileName),
    };

    // enum 파일명
    if(-1 == this.config.yamlEnumFileName?.lastIndexOf('.yaml', this.config.yamlEnumFileName.length)) {
      this.config.yamlEnumFileName = this.config.yamlEnumFileName.concat('.yaml');
    }

    // interface 파일명
    if(-1 == this.config.yamlInterfaceFileName?.lastIndexOf('.yaml', this.config.yamlInterfaceFileName.length)) {
      this.config.yamlInterfaceFileName = this.config.yamlInterfaceFileName.concat('.yaml');
    }
  }

  public static createConfigFile() {
    try {
      fs.writeFileSync(configFileName, configFileData, { encoding: 'utf8', flag: 'wx' });
      console.log(`${configFileName} 파일 생성완료`);
    } catch(err) {
      console.log(`${configFileName} 파일이 이미 있습니다.`);
    }
    process.exit();
  }
}
