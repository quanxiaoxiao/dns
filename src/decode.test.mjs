import assert from 'node:assert';
import { test, mock } from 'node:test';
import decode from './decode.mjs';

test('decode', () => {
  assert.throws(() => {
    decode([]);
  });
});

test('decode handler with obj 1', () => {
  const handler = mock.fn((chunk, payload, buf) => {
    assert.equal(chunk.toString(), 'aab');
    assert.equal(buf.toString(), 'aabb');
    payload.name = 'quan';
  });
  const execute = decode([
    {
      size: 3,
      fn: handler,
    },
  ]);
  let ret = execute(Buffer.from('aa'));
  assert.equal(ret, null);
  assert.equal(handler.mock.calls.length, 0);
  ret = execute(Buffer.from('bb'));
  assert.equal(handler.mock.calls.length, 1);
  assert.deepEqual(ret.payload, { name: 'quan' });
  assert.equal(ret.buf.toString(), 'b');
});

test('decode handler with obj 2', () => {
  const handler = mock.fn((chunk, payload, buf) => {
    assert.equal(chunk.toString(), 'aab');
    assert.equal(buf.toString(), 'aabb');
    payload.name = 'quan';
  });
  const readSize = mock.fn((payload) => {
    assert.deepEqual(payload, {});
    return 3;
  });
  const execute = decode([
    {
      size: readSize,
      fn: handler,
    },
  ]);
  let ret = execute(Buffer.from('aa'));
  assert.equal(readSize.mock.calls.length, 1);
  assert.equal(ret, null);
  assert.equal(handler.mock.calls.length, 0);
  ret = execute(Buffer.from('bb'));
  assert.equal(readSize.mock.calls.length, 2);
  assert.equal(handler.mock.calls.length, 1);
  assert.deepEqual(ret.payload, { name: 'quan' });
  assert.equal(ret.buf.toString(), 'b');
  assert.throws(() => {
    execute(Buffer.from('ooo'));
  });
});

test('decode handler with obj 3', () => {
  const handler = mock.fn((chunk, payload) => {
    assert.equal(chunk.toString(), 'aaa');
    payload.name = 'good';
  });
  const handler2 = mock.fn((chunk, payload, buf) => {
    assert.equal(chunk.toString(), 'bc');
    assert.deepEqual(payload, { name: 'good' });
    payload.foo = 'bar';
    assert.equal(buf.toString(), 'aaabcc');
  });
  const execute = decode([
    {
      size: 3,
      fn: handler,
    },
    {
      size: 2,
      fn: handler2,
    },
  ]);
  let ret = execute(Buffer.from('aaa'));
  assert.equal(ret, null);
  assert.equal(handler.mock.calls.length, 1);
  assert.equal(handler2.mock.calls.length, 0);
  ret = execute(Buffer.from('b'));
  assert.equal(ret, null);
  assert.equal(handler.mock.calls.length, 1);
  assert.equal(handler2.mock.calls.length, 0);
  ret = execute(Buffer.from('cc'));
  assert.equal(handler.mock.calls.length, 1);
  assert.equal(handler2.mock.calls.length, 1);
  assert.deepEqual(ret.payload, { name: 'good', foo: 'bar' });
  assert.equal(ret.buf.toString(), 'c');
});

test('decode handler with function', () => {
  const handler = mock.fn((chunk, payload) => {
    assert(handler.mock.calls.length <= 1);
    if (handler.mock.calls.length === 0) {
      payload.name = 'quan';
      return [];
    }
    payload.age = 22;
    return [2];
  });
  const handler2 = mock.fn((chunk, payload, buf) => {
    assert.equal(chunk.toString(), 'bbccee');
    assert.deepEqual(payload, { name: 'quan', age: 22 });
    assert.equal(buf.toString(), 'aabbccee');
    payload.foo = 'bar';
    return [2];
  });
  const execute = decode([handler, handler2]);

  let ret = execute(Buffer.from([]));
  assert.equal(ret, null);
  assert.equal(handler.mock.calls.length, 0);
  ret = execute(Buffer.from('aabbcc'));
  assert.equal(ret, null);
  assert.equal(handler.mock.calls.length, 1);
  assert.equal(handler2.mock.calls.length, 0);
  ret = execute(Buffer.from('ee'));
  assert.deepEqual(ret.payload, { name: 'quan', age: 22, foo: 'bar' });
  assert.equal(ret.buf.toString(), 'ccee');
  assert.equal(handler2.mock.calls.length, 1);
  assert.throws(() => {
    execute(Buffer.from('ooo'));
  });
});

test('decode 2', () => {
  const handler1 = mock.fn((chunk, payload) => {
    if (handler1.mock.calls.length === 0) {
      assert.equal(chunk.toString(), 'aa');
      assert.deepEqual(payload, {});
    }
    if (handler1.mock.calls.length === 1) {
      payload.cc = '666';
      assert.equal(chunk.toString(), 'cc');
    }
  });
  const handler2 = mock.fn((chunk, payload) => {
    if (handler2.mock.calls.length === 0) {
      assert.deepEqual(payload, {});
      payload.bb = '111';
      assert.equal(chunk.toString(), 'bb');
      return [];
    }
    if (handler2.mock.calls.length === 1) {
      assert.deepEqual(payload, { bb: '111' });
      assert.equal(chunk.toString(), 'bbccccc');
      const offset = 2;
      const skip = -1;
      return [offset, skip];
    }
    assert.equal(chunk.toString(), 'ccc');
    assert.deepEqual(payload, { bb: '111', cc: '666' });
    const offset = 3;
    return [offset];
  });
  const handler3 = mock.fn((chunk, payload) => {
    assert.deepEqual(payload, { bb: '111', cc: '666' });
    payload.foo = 'bar';
    assert.equal(chunk.toString(), 'efg777777');
  });
  const readSize = mock.fn(() => 9);
  const execute = decode([
    {
      size: 2,
      fn: handler1,
    },
    handler2,
    {
      size: readSize,
      fn: handler3,
    },
  ]);

  let ret = execute(Buffer.from('aabb'));
  assert.equal(ret, null);
  assert.equal(handler1.mock.calls.length, 1);
  assert.equal(handler2.mock.calls.length, 1);
  assert.equal(handler3.mock.calls.length, 0);
  assert.equal(readSize.mock.calls.length, 0);
  ret = execute(Buffer.from('ccccc'));
  assert.equal(ret, null);
  assert.equal(handler1.mock.calls.length, 2);
  assert.equal(handler2.mock.calls.length, 3);
  assert.equal(readSize.mock.calls.length, 1);
  assert.equal(handler3.mock.calls.length, 0);
  ret = execute(Buffer.from('efg'));
  assert.equal(ret, null);
  assert.equal(readSize.mock.calls.length, 2);
  assert.equal(handler3.mock.calls.length, 0);
  ret = execute(Buffer.from('7777777'));
  assert.equal(ret.buf.toString(), '7');
  assert.equal(handler3.mock.calls.length, 1);
  assert.equal(readSize.mock.calls.length, 3);
  assert.deepEqual(ret.payload, { bb: '111', cc: '666', foo: 'bar' });
});
