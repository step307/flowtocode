import { promises as fs } from 'node:fs';
// import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import FtcGenerateCode from '../../../../src/commands/ftc/generate/code.js';

describe('ftc generate code', () => {
  afterEach(async () => {
    const files = await fs.readdir('./test/resources');
    for (const file of files) {
      /* eslint-disable no-await-in-loop */
      if (file.endsWith('.ftc')) {
        await fs.rm(`./test/resources/${file}`);
      }
      /* eslint-enable no-await-in-loop */
    }
  });

  it('runs on test flow', async () => {
    await FtcGenerateCode.run(['--file', './test/resources/test.flow-meta.xml']);
    const expected: string = await fs.readFile('./test/resources/test.flow.expected', 'utf8');
    const output: string = await fs.readFile('./test/resources/test.ftc', 'utf8');
    expect(output.replace(/\r/g, '')).to.equal(expected.replace(/\r/g, ''));
  });
  it('runs on decision flow', async () => {
    await FtcGenerateCode.run(['--file', './test/resources/test_decision.flow-meta.xml']);
    const expected: string = await fs.readFile('./test/resources/test_decision.flow.expected', 'utf8');
    const output: string = await fs.readFile('./test/resources/test_decision.ftc', 'utf8');
    expect(output.replace(/\r/g, '')).to.equal(expected.replace(/\r/g, ''));
  });
  it('runs on subflow', async () => {
    await FtcGenerateCode.run(['--file', './test/resources/test_subflow.flow-meta.xml']);
    const expected: string = await fs.readFile('./test/resources/test_subflow.flow.expected', 'utf8');
    const output: string = await fs.readFile('./test/resources/test_subflow.ftc', 'utf8');
    expect(output.replace(/\r/g, '')).to.equal(expected.replace(/\r/g, ''));
  });
});
