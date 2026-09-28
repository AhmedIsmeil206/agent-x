import { test } from 'node:test';
import assert from 'node:assert/strict';
import { total } from './cart.js';
test('total sums price times qty', () => {
  assert.equal(total([{ price: 5, qty: 2 }, { price: 1, qty: 3 }]), 13);
});
