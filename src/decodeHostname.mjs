import assert from 'node:assert';
import { Buffer } from 'node:buffer';

const decodeHostname = (chunk, buf) => {
  assert(Buffer.isBuffer(chunk));
  if (chunk.length === 0 || buf.length === 0) {
    return [];
  }
  const nameList = [];
  let offset = 0;
  let nameSize = chunk.readUint8(offset++);
  while (nameSize !== 0 && offset < chunk.length) {
    if (nameSize === 0xc0) {
      if (offset >= chunk.length) {
        throw new Error('Invalid pointer offset');
      }
      assert(offset >= 1);
      const pointerOffset = chunk.readUint16BE(offset - 1) - 0xc000;
      nameList.push(decodeHostname(buf.subarray(pointerOffset), buf));
      break;
    }
    if (offset + nameSize > chunk.length) {
      throw new Error('Invalid name length');
    }
    nameList.push(chunk.subarray(offset, offset + nameSize));
    offset += nameSize;
    if (offset >= chunk.length) {
      break;
    }
    nameSize = chunk.readUint8(offset++);
  }
  return nameList;
};

export default decodeHostname;
