import fs from 'fs';

namespace PasrerTs {
  interface IEnumPropertie {
    enumerator : string,
    constexpr?: number,
    description?: string,
  }

  export interface IEnumDefinition {
    name: string,
    description?: string,
    properties: IEnumPropertie[],
  }

  interface IInterfacePropertie {
    name: string,
    type: string,
    description?: string,
    example?: string,
  }

  export interface IInterfaceDefinition {
    name: string,
    description?: string,
    properties: IInterfacePropertie[]
  }

  interface IParsingString {
    startPos: number,
    endPos: number,
    parsingString: string,
  }

  class TsParserParent {
    protected readStream: fs.ReadStream;
    private readonly checkObjDescription = '@description'

    constructor(filePath: string) {
      try{
        this.readStream = fs.createReadStream(filePath);
      } catch(err) {
        throw err;
      }
    }

    private descriptionJSDocFilter(strData: string): string {
      let temp = strData.replace(/[\/\*]/g, '').trim().split('\r\n');
      for(let i=0; i < temp.length; i++) {
        temp[i] = temp[i].trim();
      }
      return temp.join(' ');
    }

    public onError(callback: (err:Error) => void) {
      this.readStream.on('error', callback);
    }

    protected parsingObject(strData: string, startStr: string, endStr: string): (null | IParsingString) {
      let movePos = 0;
      let startPos = 0;
      let endPos = 0;

      startPos = strData.indexOf(startStr, movePos);
      if(-1 == startPos) {
        return null;
      }
      movePos = startPos;

      endPos = strData.indexOf(endStr, movePos);
      if(-1 == endPos) {
        return null
      }
      endPos += 1;

      let parsingStr = strData.substr(startPos, endPos - startPos).trim();
      if(0 >= parsingStr.length) {
        return null;
      }

      return {
        startPos: startPos,
        endPos: endPos,
        parsingString: parsingStr,
      }
    }

    protected parsingObjectDescription(strData: string): (null | string) {
      strData = strData.trim();
      if(0 == strData.length) {
        return null;
      }

      let startIdx:number;
      let endIdx: number;
      startIdx = strData.lastIndexOf('/**', strData.length);
      if (-1 != startIdx) {
        startIdx += 3;
        endIdx = strData.indexOf(this.checkObjDescription, startIdx);
        if(-1 == endIdx) {
          endIdx = strData.indexOf('*/', startIdx);
          if(-1 == endIdx) {
            return null;
          }

          return this.descriptionJSDocFilter(strData.substr(startIdx, endIdx - startIdx));
        }

        startIdx = endIdx + this.checkObjDescription.length + 1;
        endIdx = strData.indexOf('@', startIdx);
        if(-1 == endIdx) {
          endIdx = strData.indexOf('*/', startIdx);
        }

        if(-1 == endIdx) {
          return null;
        }

        return this.descriptionJSDocFilter(strData.substr(startIdx, endIdx - startIdx));
      }

      startIdx = strData.lastIndexOf('//', strData.length);
      if(-1 != startIdx) {
        startIdx += 2;
        endIdx = strData.indexOf('\n', startIdx);
        if(-1 == endIdx) {
          return null;
        }

        let temp = strData.substr(startIdx, endIdx - startIdx).trim();
        if(-1 != temp.indexOf('#region ')) {
          return null;
        }

        if(-1 != temp.indexOf('#endregion')) {
          return null;
        }

        return temp;
      }

      return null;
    }

    protected parsingObjectName(strData: string, startStr: string, endStr: (string | string[])): (null | string) {
      let startIdx = startStr.length + 1;
      let endIdx = 0;

      if('string' == typeof endStr) {
        endIdx = strData.indexOf(endStr, 0);
        if(-1 == endIdx) {
          return null
        }
      } else {
        let isCheck = false;
        for(let i=0; i < endStr.length; i++) {
          endIdx = strData.indexOf(endStr[i], 0);
          if(-1 != endIdx) {
            isCheck = true;
            break;
          }
        }

        if(false == isCheck) {
          return null;
        }
      }

      return strData.substr(startIdx, endIdx - startIdx).trim();
    }

    protected parsingSplitPropertie(strData: string) : (null | string[]) {
      let pos = 0;
      let startIdx = 0;
      let endIdx = 0;
      startIdx = strData.indexOf('{', pos);
      if(-1 == startIdx) {
        return null
      }
      pos = startIdx + 1;

      endIdx = strData.indexOf('}', pos);
      if(-1 == endIdx) {
        return null;
      }

      return strData.substr(startIdx, endIdx - startIdx).replace(/[\{\}\r]/g, '').split('\n');
    }

    protected isPropertie(strData: string): boolean {
      if(0 == strData.length) {
        return false;
      } else if('//' == strData.substr(0, 2)) {
        return false;
      }

      return true;
    }
  }

  export class TsParserEnum extends TsParserParent {
    constructor(filePath: string) {
      super(filePath);
    }

    public parsing(): Promise<Array<IEnumDefinition>> {
      return new Promise((resolve) => {
        this.readStream.on('data', async (data) => {
          let curPos = 0;
          let definitions = new Array<IEnumDefinition>();
          while(true) {
            let retVal = this.parsingObject(('' + data).substring(curPos), "enum", "}");
            if(null == retVal) {
              break;
            }

            let strDescription = ('' + data).substring(curPos, curPos + retVal.startPos);
            let objDescription = this.parsingObjectDescription(strDescription);

            let objName = this.parsingObjectName(retVal.parsingString, 'enum', "{");
            if(null == objName) {
              break;
            }

            let properties = this.parsingPropertie(retVal.parsingString);

            definitions.push({
              name: objName,
              description: (null == objDescription ? undefined : objDescription),
              properties: properties
            });

            curPos += retVal.endPos;
          }
          resolve(definitions);
        });
      });
    }

    private parsingPropertie(strData: string): Array<IEnumPropertie> {
      let retData: Array<IEnumPropertie> = new Array<IEnumPropertie>();

      let strProperties = this.parsingSplitPropertie(strData);
      if(null == strProperties) {
        throw 'is null strProperties'
      }

      strProperties.forEach((strPropertie) => {
        strPropertie = strPropertie.trim();
        if(false == this.isPropertie(strPropertie)) {
          return;
        }

        let data = this.parsingPropertieDetail(strPropertie);
        if(null == data) {
          return;
        }

        retData.push(data);
      });

      return retData;
    }

    private parsingPropertieDetail(strData: string): (null | IEnumPropertie) {
      let enumerator: string;
      let constexpr: (undefined | number);
      let description: (undefined | string);

      let startPos = 0;
      let endPos = strData.indexOf('=', 0);
      if(-1 != endPos) {
        // enumerator 파싱
        enumerator = strData.substr(0, endPos).trim();
        startPos = endPos + 1;

        // constexpr 파싱
        endPos = strData.indexOf(',', startPos);
        if(-1 == endPos) {
          endPos = strData.indexOf('//', startPos);
          if(-1 == endPos) {
            endPos = strData.length;
          }
        }
        let temp = strData.substr(startPos, endPos - startPos).trim();
        constexpr = Number(temp);
      } else {
         // enumerator 파싱
        endPos = strData.indexOf(',', 0);
        if(-1 == endPos) {
          endPos = strData.length;
        }
        enumerator = strData.substr(0, endPos).trim();
      }

      // description 파싱
      startPos = strData.indexOf('//', 0);
      if(-1 != startPos) {
        startPos += 2;
        endPos = strData.length;
        description = strData.substr(startPos, endPos - startPos).trim();
      }

      return {
        enumerator: enumerator,
        constexpr: constexpr,
        description: description,
      };
    }
  }

  export class TsParserInterface extends TsParserParent {
    private readonly checkExtends = 'extends';
    constructor(filePath: string) {
      super(filePath);
    }

    public parsing(): Promise<Array<IInterfaceDefinition>> {
      return new Promise((resolve) => {
        this.readStream.on('data', async (data) => {
          let curPos = 0;
          let definitions = new Array<IInterfaceDefinition>();
          while(true) {
            let retVal = this.parsingObject(('' + data).substring(curPos), "interface", "}");
            if(null == retVal) {
              break;
            }

            let strDescription = ('' + data).substring(curPos, curPos + retVal.startPos);
            let objDescription = this.parsingObjectDescription(strDescription);

            let objName = this.parsingObjectName(retVal.parsingString, "interface", ["extends", "{"]);
            if(null == objName) {
              break;
            }

            let properties = this.parsingPropertie(retVal.parsingString);

            definitions.push({
              name: objName,
              description: (null == objDescription ? undefined : objDescription),
              properties: properties,
            });

            curPos += retVal.endPos;
          }

          resolve(definitions);
        });
      });
    }

    private parsingPropertie(strData: string): Array<IInterfacePropertie> {
      let retData: Array<IInterfacePropertie> = new Array<IInterfacePropertie>();

      let extendPropertie = this.parsingPropertieExtends(strData);
      if(extendPropertie) {
        retData.push(extendPropertie);
      }

      let strProperties = this.parsingSplitPropertie(strData);
      if(null == strProperties) {
        throw 'is null strProperties'
      }

      strProperties.forEach((strPropertie) => {
        strPropertie = strPropertie.trim();
        if(false == this.isPropertie(strPropertie)) {
          return;
        }

        let data = this.parsingPropertieDetail(strPropertie);
        if(null == data) {
          return;
        }

        retData.push(data);
      });

      return retData;
    }

    private parsingPropertieExtends(strData: string): (null | IInterfacePropertie) {
      let startIdx = strData.indexOf(this.checkExtends, 0);
      if(-1 == startIdx) {
        return null;
      }

      startIdx += this.checkExtends.length + 1;
      let endIdx = strData.indexOf('{', startIdx);
      if(-1 == endIdx) {
        return null;
      }

      return {
        name: strData.substr(startIdx, endIdx - startIdx).trim(),
        type: 'object',
      }
    }

    private parsingPropertieDetail(strData: string): (null | IInterfacePropertie) {
      let name: string;
      let type: string;
      let description: (undefined | string);
      let example: (undefined | string);

      let pos = strData.indexOf(':', 0);
      if(-1 == pos) {
        return null;
      }
      name = strData.substr(0, pos).trim();

      pos += 1;
      strData = strData.substr(pos).trimLeft();
      pos = strData.indexOf(',', 0);
      if(-1 == pos) {
        pos = strData.indexOf(' ', 0);
        if(-1 == pos) {
          pos = strData.length;
        }
      }

      if(strData.length != pos) {
        pos += 1;
      }

      type = strData.substr(0, pos).replace(',', '').trim();
      if(-1 != type.indexOf('|', 0)) {
        type = type.replace(/[\(\)\|]/g,'').replace('null', '').trim();
      }

      strData = strData.substr(pos).trimLeft().replace('//', '').trimLeft();
      if(0 != strData.length) {
        let remarkSplit = strData.split('@ex');

        if(1 == remarkSplit.length) {
          description = remarkSplit[0].trim();
        }

        if(2 == remarkSplit.length) {
          description = remarkSplit[0].trim();
          example = remarkSplit[1].trim();
        }
      }

      return {
        name: name,
        type: type,
        description: description,
        example: example
      };
    }
  }
}

export = PasrerTs;
