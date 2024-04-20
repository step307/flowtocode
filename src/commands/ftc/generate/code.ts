import { promises as fs } from 'node:fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import * as xml2js from 'xml2js';
import { Flow } from '../../../flow/Flow.js';
import { FlowParser } from '../../../parse/FlowParser.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('flowtocode', 'ftc.generate.code');

export type FtcGenerateCodeResult = {
  path: string;
};

type ParsedXml = {
  Flow: Flow; // Replace 'any' with the actual type if known
};

export default class FtcGenerateCode extends SfCommand<FtcGenerateCodeResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    file: Flags.string({
      summary: 'todo',
      description: 'todo',
      char: 'f',
      required: true,
    }),
  };

  public async run(): Promise<FtcGenerateCodeResult> {
    const { flags } = await this.parse(FtcGenerateCode);

    const filename: string = flags.file;
    const fileContent: string = await fs.readFile(filename, 'utf-8');
    const parser: xml2js.Parser = new xml2js.Parser({ explicitArray: false });
    const flow: Flow = ((await parser.parseStringPromise(fileContent)) as ParsedXml).Flow;
    const parseTree: string = new FlowParser().toPseudoCode(flow);
    this.log(parseTree);
    // this.log(JSON.stringify(flow, null, 2));
    // for (const step of flow.actionCalls ?? []) {
    //   this.log(JSON.stringify(step, null, 2));
    // }
    return {
      path: '/Users/jdr/projects/flowtocode/src/commands/ftc/generate/code.ts',
    };
  }
}
