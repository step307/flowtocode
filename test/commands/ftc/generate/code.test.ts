import { promises as fs } from 'node:fs';
import { TestContext } from '@salesforce/core/testSetup';
import { expect } from 'chai';
import { stubSfCommandUx } from '@salesforce/sf-plugins-core';
import FtcGenerateCode from '../../../../src/commands/ftc/generate/code.js';

describe('ftc generate code', () => {
  const $$ = new TestContext();
  let sfCommandStubs: ReturnType<typeof stubSfCommandUx>;

  beforeEach(() => {
    sfCommandStubs = stubSfCommandUx($$.SANDBOX);
  });

  afterEach(() => {
    $$.restore();
  });

  it('runs on test.flow', async () => {
    await FtcGenerateCode.run(['--file', './test/resources/test.flow']);
    const expected: string = await fs.readFile('./test/resources/test.flow.out', 'utf8');
    const output = sfCommandStubs.log
      .getCalls()
      .flatMap((c) => c.args)
      .join('\n');
    expect(output).to.equal(expected);
  });
});
