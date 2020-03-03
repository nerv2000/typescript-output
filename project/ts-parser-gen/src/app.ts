import TsParserConfig from './modules/parserConfig'
import TsParser from './modules/parser';
import commander from 'commander';

commander.name('tsgen');

commander
  .option('-i, --init', 'create tsparser.json5')
  .option('-p, --path <path>', 'root path setting')
  .parse(process.argv);

if(true == commander.init) {
  TsParserConfig.createConfigFile(commander.path);
} else {
  let rootPath = './';
  if(commander.path) {
    rootPath = commander.path
  }
  let ppConfig = new TsParserConfig(rootPath);
  let parser = new TsParser(ppConfig.config);
  parser.start(() => {
    console.log('packet gen end...');
    process.exit();
  });
}
