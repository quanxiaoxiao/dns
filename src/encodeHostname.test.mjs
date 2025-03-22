import assert from 'node:assert';
import test from 'node:test';

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

test('encodeHostname - 正确解析主机名', () => {
  const result1 = encodeHostname('example.com');
  const expected1 = Buffer.concat([
    Buffer.from([0x07]),
    Buffer.from('example'),
    Buffer.from([0x03]),
    Buffer.from('com'),
    Buffer.from([0x00]),
  ]);
  assert.deepStrictEqual(result1, expected1);

  const result2 = encodeHostname('sub.domain.example.com');
  const expected2 = Buffer.concat([
    Buffer.from([0x03]),
    Buffer.from('sub'),
    Buffer.from([0x06]),
    Buffer.from('domain'),
    Buffer.from([0x07]),
    Buffer.from('example'),
    Buffer.from([0x03]),
    Buffer.from('com'),
    Buffer.from([0x00]),
  ]);
  assert.deepStrictEqual(result2, expected2);

  assert.throws(() => encodeHostname(''), {
    message: 'Hostname cannot be empty',
  });

  assert.throws(() => encodeHostname(123), {
    message: 'Input must be a string',
  });

  const result5 = encodeHostname('  example.com  ');
  const expected5 = Buffer.concat([
    Buffer.from([0x07]),
    Buffer.from('example'),
    Buffer.from([0x03]),
    Buffer.from('com'),
    Buffer.from([0x00]),
  ]);
  assert.deepStrictEqual(result5, expected5);
});
