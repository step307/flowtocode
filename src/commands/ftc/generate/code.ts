import { promises as fs } from 'node:fs';
import { SfCommand, Flags } from '@salesforce/sf-plugins-core';
import { Messages } from '@salesforce/core';
import * as xml2js from 'xml2js';
import { Flow } from '../../../flow/Flow.js';
import { FlowParser, ParseTreeNode } from '../../../parse/FlowParser.js';
// import { DefaultFtcFormatter } from '../../../format/DefaultFtcFormatter.js';
import { JsFormatter } from '../../../format/JsFormatter.js';

Messages.importMessagesDirectoryFromMetaUrl(import.meta.url);
const messages = Messages.loadMessages('flowtocode', 'ftc.generate.code');

export type FtcGenerateCodeResult = {
  path: string;
};

type ParsedXml = {
  Flow: Flow; // Replace 'any' with the actual type if known
};

export interface FormatterInterface {
  convertToPseudocode(node: ParseTreeNode, tabLevel?: number): Promise<string>;
}
export default class FtcGenerateCode extends SfCommand<FtcGenerateCodeResult> {
  public static readonly summary = messages.getMessage('summary');
  public static readonly description = messages.getMessage('description');
  public static readonly examples = messages.getMessages('examples');

  public static readonly flags = {
    file: Flags.string({
      summary: messages.getMessage('flags.file.summary'),
      char: 'f',
      required: true,
    }),
    output: Flags.string({
      summary: messages.getMessage('flags.output.summary'),
      char: 'd',
      required: false,
    }),
  };

  private static getOutputPath(filepath: string, outputDir?: string): string {
    if (outputDir) {
      const filename = filepath.split('/').pop()?.replace('.flow-meta.xml', '.ftc') ?? 'flow.ftc';
      return `${outputDir}/${filename}`;
    }
    return filepath.replace('.flow-meta.xml', '.ftc');
  }

  public async run(): Promise<FtcGenerateCodeResult> {
    const { flags } = await this.parse(FtcGenerateCode);

    const filepath: string = flags.file;
    const fileContent: string = await fs.readFile(filepath, 'utf-8');
    const xmlParser: xml2js.Parser = new xml2js.Parser({ explicitArray: false, valueProcessors: [xml2js.processors.parseBooleans] });
    const flow: Flow = ((await xmlParser.parseStringPromise(fileContent)) as ParsedXml).Flow;
    const flowParser: FlowParser = new FlowParser();
    const formatter: FormatterInterface = new JsFormatter(); // TODO: add format selection
    const treeNode: ParseTreeNode = flowParser.parse(flow);
    const parseTree: string = await formatter.convertToPseudocode(treeNode);
    this.log(parseTree); // TODO: remove me
    const outputPath: string = FtcGenerateCode.getOutputPath(filepath, flags.output);
    await fs.writeFile(outputPath, parseTree, 'utf-8');
    this.log(`Output written to ${outputPath}`);
    return {
      path: outputPath,
    };
  }
}
