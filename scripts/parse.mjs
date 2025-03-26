import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

import {
  depack,
} from '@quanxiaoxiao/bytes';

import decodeAnswer from '../src/decodeAnswer.mjs';
import {
  RECORD_TYPE_A,
  RECORD_TYPE_CNAME,
} from '../src/recordTypes.mjs';

let buf = fs.readFileSync(path.resolve(process.cwd(), 'data', 'ipv4'));

while (buf && buf.length > 0) {
  const ret = depack()(buf);
  if (!ret) {
    break;
  }
  const { payload } = decodeAnswer(ret.payload);
  assert(payload.transactionId >= 0);
  assert.equal(
    payload.answers.filter((d) => d.recordType === RECORD_TYPE_A || d.recordType === RECORD_TYPE_CNAME).length,
    payload.answerRecordCount,
  );
  buf = ret.buf;
}
