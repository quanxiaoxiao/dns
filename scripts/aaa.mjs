import assert from 'node:assert';
import tls from 'node:tls';

import {
  depack,
  enpack,
} from '@quanxiaoxiao/bytes';

import decodeAnswer from '../src/decodeAnswer.mjs';
import encodeV4 from '../src/encodeV4.mjs';
import { RECORD_TYPE_A } from '../src/recordTypes.mjs';

const socket = tls.connect({
  host: '223.5.5.5',
  noDelay: true,
  port: 853,
  secureContext: tls.createSecureContext({
    secureProtocol: 'TLSv1_2_method',
  }),
});

const id = 33;

socket.on('connect', () => {
  console.log('connect');
  socket.write(enpack(encodeV4({
    identification: id,
    hostname: 'www.zhihu.com',
  }), 2));
});

const executeDepack = depack();

socket.on('data', (chunk) => {
  const ret = executeDepack(chunk);
  if (ret) {
    const { payload } = decodeAnswer(ret.payload);
    assert(payload.identification === id);
    const addressList = payload.answers.filter((d) => d.recordType === RECORD_TYPE_A);
    console.log(addressList);
  }
});
