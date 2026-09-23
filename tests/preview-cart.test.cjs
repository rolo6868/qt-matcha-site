const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../js/preview-cart.js'), 'utf8');
function setup(saved = '[]', blocked = false) {
  const storage = { value: saved, getItem() { if (blocked) throw Error('blocked'); return this.value; }, setItem(key, value) { if (blocked) throw Error('blocked'); this.value = value; } };
  const context = { window: {}, sessionStorage: storage };
  vm.runInNewContext(source, context);
  return { cart: context.window.QTPreviewCart, storage };
}
test('merges matching picks but preserves different purchase types and survives reload', () => {
  const {cart, storage} = setup();
  cart.add({flavor:'peach', routine:'one-time', quantity:2});
  cart.add({flavor:'peach', routine:'one-time', quantity:3});
  cart.add({flavor:'peach', routine:'subscribe', quantity:1});
  assert.equal(cart.read().length, 2);
  assert.equal(cart.read()[0].quantity, 5);
  assert.equal(setup(storage.value).cart.read()[1].routine, 'subscribe');
  cart.remove(0); assert.equal(cart.read().length, 1);
});
test('invalid saved state and blocked storage do not break the bag', () => {
  for (const saved of ['not json', '{}', '[null,{"flavor":"invalid","quantity":1}]']) assert.equal(setup(saved).cart.read().length, 0);
  const {cart} = setup('[]', true);
  cart.add({flavor:'yuzu', routine:'one-time', quantity:500});
  assert.equal(cart.read()[0].quantity, 99);
  const result = cart.read(); result[0].quantity = 0;
  assert.equal(cart.read()[0].quantity, 99);
});
