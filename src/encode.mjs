import assert from 'node:assert';

import { CLASS_IN } from './classes.mjs';
import encodeHostname from './encodeHostname.mjs';
import { OPCODE_QUERY } from './opcodes.mjs';
import { RCODE_NOERROR } from './rcodes.mjs';

const FLAGS = {
  OPCODE_QUERY: OPCODE_QUERY << 3,
  AUTHORITATIVE_ANSWER_FALSE: 0 << 2,
  TRUNCATE_FLAG_FALSE: 0 << 1,
  RECURSION_DESIRED_TRUE: 1,
};

export default ({
  hostname,
  transactionId = 0,
  recordType,
}) => {
  assert(transactionId <= 65535 && transactionId >= 0);
  const bufList = [
    Buffer.allocUnsafe(2), // transactionId
    Buffer.allocUnsafe(1), // controlFirst
    Buffer.allocUnsafe(1), // controlSecond
    Buffer.allocUnsafe(2), // questionCount
    Buffer.allocUnsafe(2), // answerRecordCount
    Buffer.allocUnsafe(2), // authorityRecordCount
    Buffer.allocUnsafe(2), // additionalRecordCount
  ];
  const [
    transactionIdBuf,
    controlFirstBuf,
    controlSecondBuf,
    questionCountBuf,
    answerRecordCountBuf,
    authorityRecordCountBuf,
    additionalRecordCountBuf,
  ] = bufList;

  transactionIdBuf.writeUInt16BE(transactionId);
  const controlFirst = FLAGS.OPCODE_QUERY + FLAGS.AUTHORITATIVE_ANSWER_FALSE + FLAGS.TRUNCATE_FLAG_FALSE + FLAGS.RECURSION_DESIRED_TRUE;
  controlFirstBuf.writeUInt8(controlFirst);

  const controlSecond = RCODE_NOERROR;
  controlSecondBuf.writeUInt8(controlSecond);

  questionCountBuf.writeUInt16BE(1);
  answerRecordCountBuf.writeUInt16BE(0);
  authorityRecordCountBuf.writeUInt16BE(0);
  additionalRecordCountBuf.writeUInt16BE(0);

  const recordTypeBuf = Buffer.allocUnsafe(2);
  recordTypeBuf.writeUInt16BE(recordType);

  const classBuf = Buffer.allocUnsafe(2);
  classBuf.writeUInt16BE(CLASS_IN);

  bufList.push(
    encodeHostname(hostname),
    recordTypeBuf,
    classBuf,
  );

  return Buffer.concat(bufList);
};
