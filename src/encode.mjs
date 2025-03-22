import assert from 'node:assert';

import { CLASS_IN } from './classes.mjs';
import encodeHostname from './encodeHostname.mjs';
import { OPCODE_QUERY } from './opcodes.mjs';
import { RCODE_NOERROR } from './rcodes.mjs';

const QUERY_FLAG = 0;
// const RESPONSE_FLAG = 1 << 15;
const TRUNCATE_FLAG_FALSE = 0;
const AUTHORITATIVE_ANSWER_FALSE = 0;
// const AUTHORITATIVE_ANSWER_TRUE = 1 << 2;
// const TRUNCATE_FLAG_TRUE = 1 << 1;
const RECURSION_DESIRED_TRUE = 1;
// const RECURSION_DESIRED_FALSE = 0;
const RECURSION_AVAILABLE_FALSE = 0;
// const RECURSION_AVAILABLE_TRUE = 1;

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

  const recordTypeBuf = Buffer.allocUnsafe(2);
  const classBuf = Buffer.allocUnsafe(2);

  identificationBuf.writeUInt16BE(identification);
  let controlFirst = 0;
  let controlSecond = 0;
  controlFirst += QUERY_FLAG;
  controlFirst += (OPCODE_QUERY << 3);
  controlFirst += (AUTHORITATIVE_ANSWER_FALSE << 2);
  controlFirst += (TRUNCATE_FLAG_FALSE << 1);
  controlFirst += RECURSION_DESIRED_TRUE;
  controlFirstBuf.writeUInt8(controlFirst);

  controlSecond += (RECURSION_AVAILABLE_FALSE << 7);
  controlSecond += RCODE_NOERROR;
  controlSecondBuf.writeUInt8(controlSecond);

  questionCountBuf.writeUInt16BE(1);
  answerRecordCountBuf.writeUInt16BE(0);
  authorityRecordCountBuf.writeUInt16BE(0);
  additionalRecordCountBuf.writeUInt16BE(0);
  recordTypeBuf.writeUInt16BE(recordType);
  classBuf.writeUInt16BE(CLASS_IN);

  bufList.push(encodeHostname(hostname));
  bufList.push(recordTypeBuf);
  bufList.push(classBuf);

  return Buffer.concat(bufList);
};
