import fs from 'fs';
import path from 'path';
import { ITsParserConfig } from './parserConfig';
import PasrerTs from './parserTs';
import StringFileData from './stringFileData';

export default class TsParser {
  private _enums: Array<PasrerTs.IEnumDefinition>;
  private _interfaces: Array<PasrerTs.IInterfaceDefinition>;
  private config: ITsParserConfig;

  get enums() { return this._enums; }
  get interfaces() { return this._interfaces; }

  constructor(config: ITsParserConfig) {
    this._enums = new Array<PasrerTs.IEnumDefinition>();
    this._interfaces = new Array<PasrerTs.IInterfaceDefinition>();
    this.config = config;

    try {
      let yamlPath = path.join(this.config.rootPath, this.config.yamlOutputPath!);
      if(false == this.isFolderExists(yamlPath)) {
        fs.mkdirSync(yamlPath);
      }

    } catch(err) {
      throw err;
    }
  }

  private isFolderExists(path: string) {
    try {
      fs.statSync(path);
      return true;
    } catch(err) {
      return false;
    }
  }

  private readFilePath(searchPath: string) {
    let dirents: fs.Dirent[];
    try {
      dirents = fs.readdirSync(searchPath, {withFileTypes: true})
    } catch(err) {
      throw err;
    }

    let pathList = new Array<string>();
    dirents.forEach((dirent) => {
      if(dirent.isFile()) {
        let pos = dirent.name.lastIndexOf('.');
        if(-1 == pos) {
          return;
        }

        if('ts' == dirent.name.substr(pos+1, dirent.name.length).toLowerCase()) {
          let fileFullPath = path.join(searchPath, dirent.name);
          pathList.push(fileFullPath);
        }
        return;
      }

      let subPath = path.join(searchPath, dirent.name);
      pathList = pathList.concat(this.readFilePath(subPath));
    });

    return pathList;
  }

  private parsingFile(fileFullPaths: string[]): Promise<void> {
    return new Promise((resolve) => {
      fileFullPaths.forEach(async (fileFullPath, index) => {
        // enum 파싱
        let enumParser = new PasrerTs.TsParserEnum(fileFullPath);
        let enumDatas: Array<PasrerTs.IEnumDefinition> = await enumParser.parsing();
        this._enums = this._enums.concat(enumDatas);

        // interface 파싱
        let interfaceParser = new PasrerTs.TsParserInterface(fileFullPath);
        let interfaceDatas: Array<PasrerTs.IInterfaceDefinition> = await interfaceParser.parsing();
        this._interfaces = this._interfaces.concat(interfaceDatas);

        if(fileFullPaths.length == (index + 1) ) {
          resolve();
        }
      });
    });
  }

  private isEnum(findStr: string): boolean {
    return null != this._enums.find((elem) => elem.name == findStr) ? true : false;
  }

  private isInterface(findStr: string): boolean {
    return null != this._interfaces.find((elem) => elem.name == findStr) ? true : false;
  }

  private writeFileSync(fileFullPath: string, data: string) {
    try{
      fs.writeFileSync(fileFullPath, data, { encoding: 'utf8', flag: 'w' });
    } catch (err) {
      throw err;
    }
  }

  private createEnumFile() {
    let strNote = new StringFileData();
    strNote.writeLine(0, 'definitions:');
    this._enums.forEach((mainElem)=> {
      strNote.writeLine(1, `enum ${mainElem.name}:`);
      strNote.writeLine(2, 'type: \'object\'');
      strNote.writeLine(2, 'properties:');

      let number = 0;
      mainElem.properties.forEach((subElem) => {
        strNote.writeLine(3, `${subElem.enumerator}:`);

        if(subElem.constexpr) {
          number = subElem.constexpr;
        }

        if(subElem.description) {
          strNote.writeLine(4, `type: \'${number} - ${subElem.description}\'`);
        } else {
          strNote.writeLine(4, `type: \'${number}\'`);
        }

        number++;
      });
    });

    let fullPath = path.join(this.config.rootPath, this.config.yamlOutputPath!, this.config.yamlEnumFileName!);
    this.writeFileSync(fullPath, strNote.data);
  }

  private createInterfaceFile() {
    let strNote = new StringFileData();
    strNote.writeLine(0, 'definitions:');
    this._interfaces.forEach((mainElem) => {
      strNote.writeLine(1, `${mainElem.name}:`);
      strNote.writeLine(2, 'type: \'object\'');
      strNote.writeLine(2, 'properties:');

      mainElem.properties.forEach((subElem) => {
        strNote.writeLine(3, `${subElem.name}:`);
        if(true == this.isEnum(subElem.type)) {
          strNote.writeLine(4, 'type: \'number\'');
          strNote.writeLine(4, `description: \'enum ${subElem.type} 참조\'`);
        } else if(true == this.isInterface(subElem.name)) {
          strNote.writeLine(4, `$ref: \'#/definitions/${subElem.name}\'`);
        } else {
          strNote.writeLine(4, `type: \'${subElem.type}\'`);
          if(subElem.description) {
            strNote.writeLine(4, `description: \'${subElem.description}\'`);
          }
          if(subElem.example) {
            strNote.writeLine(4, `example: \'${subElem.example}\'`);
          }
        }
      });
    });

    let fullPath = path.join(this.config.rootPath, this.config.yamlOutputPath!, this.config.yamlInterfaceFileName!)
    this.writeFileSync(fullPath, strNote.data);
  }

  public loadData() {
    return new Promise(async (resolve) => {
      let readPath = path.join(this.config.rootPath, this.config.readFilePath!)

      // 검색할 폴더 목록 읽어오기
      let fileFullPaths = this.readFilePath(readPath);

      // 파일에서 데이터 파싱
      await this.parsingFile(fileFullPaths);

      resolve();
    });
  }

  public createFile() {
    this.createEnumFile();
    this.createInterfaceFile();
  }

  public async start(callback: () => void) {
    // 파일에서 데이터 추출
    await this.loadData();

    // 파일 쓰기
    this.createFile();

    // 끝...
    callback();
  }
}