import test from 'node:test';
import assert from 'node:assert';
import encodeHostname from './encodeHostname.mjs';

test('encodeHostname', () => {
  assert.throws(() => {
    encodeHostname(111);
  });
  assert.throws(() => {
    encodeHostname(' ');
  });

  assert(encodeHostname('quan').equals(Buffer.concat([
    Buffer.from([0x04]),
    Buffer.from('quan'),
    Buffer.from([0x00]),
  ])));
  assert(encodeHostname('www.quan').equals(Buffer.concat([
    Buffer.from([0x03]),
    Buffer.from('www'),
    Buffer.from([0x04]),
    Buffer.from('quan'),
    Buffer.from([0x00]),
  ])));
});
