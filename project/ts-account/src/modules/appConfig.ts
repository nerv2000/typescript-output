import fs from 'fs';
import path from 'path';
import appPath from 'app-root-path';
import { IConfig } from '@lib/appConfigInterfaces'

export default class AppConfig {
  private _config?: IConfig;

  constructor() {
    try {
      let fullPath = path.join(appPath.path, "config.json");
      let data = fs.readFileSync(fullPath, { encoding: 'utf8', flag: 'r' });
      this._config = JSON.parse(data);
    } catch(err) {
      console.log('not found config.json');
      process.exit();
    }
  }

  get config() {
    return this._config;
  }
}


