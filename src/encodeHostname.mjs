import assert from 'node:assert';

import { enpack } from '@quanxiaoxiao/bytes';

const CHUNK_END = Buffer.from([0x00]);

export default (str) => {
  assert(typeof str === 'string');
  const hostname = str.trim();
  assert(hostname !== '');
  const bufList = [];
  const nameList = hostname.split('.');
  for (let i = 0; i < nameList.length; i++) {
    bufList.push(enpack(nameList[i], 1));
  }
  bufList.push(CHUNK_END);
  return Buffer.concat(bufList);
};
