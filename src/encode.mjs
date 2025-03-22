import assert from 'node:assert';

import { CLASS_IN } from './classes.mjs';
import encodeHostname from './encodeHostname.mjs';
import { OPCODE_QUERY } from './opcodes.mjs';
import { RCODE_NOERROR } from './rcodes.mjs';

const FLAGS = {
  QUERY: 0,
  OPCODE_QUERY: OPCODE_QUERY << 3,
  AUTHORITATIVE_ANSWER_FALSE: 0 << 2,
  TRUNCATE_FLAG_FALSE: 0 << 1,
  RECURSION_DESIRED_TRUE: 1,
  RECURSION_AVAILABLE_FALSE: 0 << 7,
};

export default ({
  hostname,
  identification = 0,
  recordType,
}) => {
  assert(identification <= 65535 && identification >= 0);
  const bufList = [
    Buffer.allocUnsafe(2), // identification
    Buffer.allocUnsafe(1), // controlFirst
    Buffer.allocUnsafe(1), // controlSecond
    Buffer.allocUnsafe(2), // questionCount
    Buffer.allocUnsafe(2), // answerRecordCount
    Buffer.allocUnsafe(2), // authorityRecordCount
    Buffer.allocUnsafe(2), // additionalRecordCount
  ];
  const [
    identificationBuf,
    controlFirstBuf,
    controlSecondBuf,
    questionCountBuf,
    answerRecordCountBuf,
    authorityRecordCountBuf,
    additionalRecordCountBuf,
  ] = bufList;

  identificationBuf.writeUInt16BE(identification);
  const controlFirst = FLAGS.QUERY + FLAGS.OPCODE_QUERY + FLAGS.AUTHORITATIVE_ANSWER_FALSE + FLAGS.TRUNCATE_FLAG_FALSE + FLAGS.RECURSION_DESIRED_TRUE;
  controlFirstBuf.writeUInt8(controlFirst);

  const controlSecond = FLAGS.RECURSION_AVAILABLE_FALSE + RCODE_NOERROR;
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
