import decode from './decode.mjs';
import decodeHostname from './decodeHostname.mjs';
import {
  RECORD_TYPE_A,
  RECORD_TYPE_AAAA,
  RECORD_TYPE_CNAME,
} from './recordTypes.mjs';

const formatHostname = (arr) => {
  let result = '';
  for (let i = 0; i < arr.length; i++) {
    const b = arr[i];
    if (Array.isArray(b)) {
      result = result === '' ? formatHostname(b) : `${result}.${formatHostname(b)}`;
    } else {
      result = result === '' ? b.toString() : `${result}.${b.toString()}`;
    }
  }
  return result;
};

const calcHostnameLength = (arr) => {
  let result = 0;
  const len = arr.length;
  if (len === 0) {
    return 0;
  }
  for (let i = 0; i < len; i++) {
    const b = arr[i];
    if (Array.isArray(b)) {
      result += 2;
    } else {
      result += b.length + 1;
    }
  }
  if (Array.isArray(arr[len - 1])) {
    return result;
  }
  return result + 1;
};

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
      const n = chunk.readUint8(0);
      payload.isReply = (n & 128) !== 0;
      payload.opCode = (n >> 3) & 15;
      payload.isAuthoritativeAnswer = (n & 4) !== 0;
      payload.isTruncate = (n & 2) !== 0;
      payload.isRecursionDesired = (n & 1) !== 0;
    },
  },
  {
    size: 1,
    fn: (chunk, payload) => {
      const n = chunk.readUint8(0);
      payload.isRecursionAvailable = (n & 128) !== 0;
      payload.responseCode = n & 15;
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
  (chunk, payload, buf) => {
    const skip = 0;
    let offset = 0;
    if (buf.length === 0) {
      return [offset, skip];
    }
    const nameList = decodeHostname(chunk, buf);
    payload.query = {
      name: formatHostname(nameList),
    };
    offset = calcHostnameLength(nameList);
    return [offset, skip];
  },
  {
    size: 2,
    fn: (chunk, payload) => {
      payload.query.recordType = chunk.readUint16BE(0);
    },
  },
  {
    size: 2,
    fn: (chunk, payload) => {
      payload.query.class = chunk.readUint16BE(0);
    },
  },
  (chunk, payload) => {
    payload.answers = [];
    const offset = 0;
    const skip = 0;
    return [offset, skip];
  },
  (chunk, payload, buf) => {
    const skip = 0;
    let offset = 0;
    if (buf.length === 0) {
      return [offset, skip];
    }
    const nameList = decodeHostname(chunk, buf);
    payload.answers.push({
      name: formatHostname(nameList),
      recordType: null,
      class: null,
      timeToLive: null,
      dataLength: null,
    });
    offset = calcHostnameLength(nameList);
    return [offset, skip];
  },
  {
    size: 2,
    fn: (chunk, payload) => {
      const last = payload.answers[payload.answers.length - 1];
      last.recordType = chunk.readUint16BE(0);
    },
  },
  {
    size: 2,
    fn: (chunk, payload) => {
      const last = payload.answers[payload.answers.length - 1];
      last.class = chunk.readUint16BE(0);
    },
  },
  {
    size: 4,
    fn: (chunk, payload) => {
      const last = payload.answers[payload.answers.length - 1];
      last.timeToLive = chunk.readUint32BE(0);
    },
  },
  {
    size: 2,
    fn: (chunk, payload) => {
      const last = payload.answers[payload.answers.length - 1];
      last.dataLength = chunk.readUint16BE(0);
    },
  },
  {
    size: (payload) => {
      const last = payload.answers[payload.answers.length - 1];
      return last.dataLength;
    },
    fn: (chunk, payload, buf) => {
      const last = payload.answers[payload.answers.length - 1];
      switch (last.recordType) {
      case RECORD_TYPE_CNAME: {
        if (buf.length === 0) {
          last.cname = '';
          break;
        }
        const nameList = decodeHostname(chunk.subarray(0, last.dataLength), buf);
        last.cname = nameList.map((b) => b.toString()).join('.');
        break;
      }
      case RECORD_TYPE_A: {
        last.address = [
          chunk.readUint8(0),
          chunk.readUint8(1),
          chunk.readUint8(2),
          chunk.readUint8(3),
        ].join('.');
        break;
      }
      case RECORD_TYPE_AAAA: {
        const arr = [];
        const toHex = (i, isPad) => {
          const s = chunk.readUint8(i).toString(16);
          if (isPad) {
            return s.padStart(2, '0');
          }
          return s;
        };
        for (let i = 0; i < chunk.length;) {
          arr.push(`${toHex(i)}${toHex(i + 1, true)}`
            .replace(/^0+([^0])/, (a, b) => b)
            .replace(/^0+$/, '0'));
          i += 2;
        }
        last.address = arr.join(':');
        break;
      }
      default: break;
      }
    },
  },
  (chunk) => {
    const offset = 0;
    let skip = -6;
    if (chunk.length === 0 || chunk[0] === 0) {
      skip = 0;
    }
    return [offset, skip];
  },
];

export default (chunk) => decode(procedures)(chunk);
