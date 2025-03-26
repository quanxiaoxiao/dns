import assert from 'node:assert';
import { Buffer } from 'node:buffer';

const decodeHostname = (chunk, buf) => {
  assert(Buffer.isBuffer(chunk));
  if (buf.length === 0 || chunk.length === 0) {
    return [];
  }
  const nameList = [];
  let offset = 0;
  let nameSize = chunk.readUint8(offset++);
  while (nameSize !== 0 && offset < chunk.length) {
    if (nameSize === 0xc0) {
      const skip = chunk.readUint16BE(offset - 1) - 0xc000;
      if (offset >= chunk.length) {
        throw new Error('Invalid pointer offset');
      }
      nameList.push(decodeHostname(chunk.subarray(skip), buf));
      break;
    } else {
      const nameBuf = chunk.subarray(offset, offset + nameSize);
      nameList.push(nameBuf);
      offset += nameSize;
      if (offset >= chunk.length) {
        break;
      }
      nameSize = chunk.readUint8(offset);
      offset += 1;
    }
  }
  return nameList;
};

export default decodeHostname;
