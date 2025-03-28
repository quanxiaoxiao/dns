import assert from 'node:assert';

import { decode } from '@quanxiaoxiao/bytes';

import calcHostnameLength from './calcHostnameLength.mjs';
import decodeHostname from './decodeHostname.mjs';
import formatHostname from './formatHostname.mjs';

const procedures = [
  {
    size: 2,
    description: 'transaction id',
    fn: (chunk, payload) => {
      payload.transactionId = chunk.readUint16BE(0);
    },
  },
  {
    size: 1,
    fn: (chunk, payload) => {
      payload.flags = {
        isResponse: null,
        opCode: null,
        isTruncate: null,
        isRecursionDesired: null,
        isNoneAuthenticate: null,
        isADBit: null,
      };
      const n = chunk.readUint8(0);
      payload.flags.isResponse = (n & 128) !== 0;
      assert(!payload.flags.isResponse);
      payload.flags.opCode = (n >> 3) & 15;
      payload.flags.isTruncate = (n & 2) !== 0;
      payload.flags.isRecursionDesired = (n & 1) !== 0;
    },
  },
  {
    size: 1,
    fn: (chunk, payload) => {
      const n = chunk.readUint8(0);
      payload.flags.isAuthenticatedData = (n & 32) !== 0;
      payload.flags.isNoneAuthenticate = (n & 16) !== 0;
    },
  },
  {
    size: 2,
    description: 'question count',
    fn: (chunk, payload) => {
      payload.questionCount = chunk.readUint16BE(0);
    },
  },
  {
    size: 2,
    description: 'answer record count',
    fn: (chunk, payload) => {
      payload.answerRecordCount = chunk.readUint16BE(0);
    },
  },
  {
    size: 2,
    description: 'authority record count',
    fn: (chunk, payload) => {
      payload.authorityRecordCount = chunk.readUint16BE(0);
    },
  },
  {
    size: 2,
    description: 'addition record count',
    fn: (chunk, payload) => {
      payload.additionalRecordCount = chunk.readUint16BE(0);
    },
  },
  {
    size: 2,
    fn: (chunk, payload) => {
      payload.query = {};
    },
  },
  (chunk, payload, buf) => {
    const nameList = decodeHostname(chunk, buf);
    payload.query.name = formatHostname(nameList);
    const skip = 0;
    const offset = calcHostnameLength(nameList);
    return [offset, skip];
  },
  {
    size: 2,
    fn: (chunk, payload) => {
      payload.query.type = chunk.readUint16BE(0);
    },
  },
  {
    size: 2,
    fn: (chunk, payload) => {
      payload.query.class = chunk.readUint16BE(0);
    },
  },
];

export default (chunk) => decode(procedures)(chunk);
