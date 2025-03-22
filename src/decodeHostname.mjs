import assert from 'node:assert';
import { Buffer } from 'node:buffer';

const decodeHostname = (chunk, buf) => {
  assert(Buffer.isBuffer(chunk));
  if (buf.length === 0) {
    return [];
  }
  const nameList = [];
  let nameSize = chunk.readUint8(0);
  let offset = 1;
  while (nameSize !== 0
    && chunk.length > offset
  ) {
    if (nameSize === 0xc0) {
      const skip = chunk.readUint16BE(offset - 1) - 0xc000;
      assert(skip <= chunk.length);
      nameList.push(decodeHostname(chunk.slice(skip), buf));
      break;
    } else {
      const nameBuf = chunk.slice(offset, offset + nameSize);
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
