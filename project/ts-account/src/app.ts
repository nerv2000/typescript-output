import 'module-alias/register';
import appRootPath from 'app-root-path';
import AppConfig from '@modules/appConfig';
import AppStart from '@modules/appStart'
import TsParserConfig from '@lib/parser-gen/parserConfig'
import TsParser from '@lib/parser-gen/parser';

async function appStart(port?: number) {
  const appConfig = new AppConfig();
  const appStart = new AppStart(appConfig.config!);
  if(undefined == port) {
    await appStart.listen(appConfig.config!.port);
  } else {
    await appStart.listen(port!);
  }
}

function init() {
  TsParserConfig.createConfigFile();
}

function gen() {
  let ppConfig = new TsParserConfig(appRootPath.path);
  let parser = new TsParser(ppConfig.config);
  parser.start(() => {
    console.log('packet gen end...');
    process.exit();
  });
}

////////////////////////////////////////////////////////////////////////

var args = process.argv.slice(2);
if(0 == args.length) {
  appStart();
} else {
  let checkStr = args[0].trim();
  if('init' == checkStr) {
    init();
  } else if('gen' == checkStr) {
    gen();
  } else {
    appStart(Number(checkStr));
  }
}