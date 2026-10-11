import { test } from 'node:test'
import assert from 'node:assert/strict'

import { expandedTextBox } from '../src/layout.ts'

test('zoomed: a reading column at most 520 wide, centered, 20 in from the top and bottom', () => {
  assert.deepEqual(expandedTextBox({ left: 0, top: 20, width: 1024, height: 748 }), {
    left: 252,
    top: 40,
    width: 520,
    height: 708,
  })
  // The area's own offset carries through.
  assert.deepEqual(expandedTextBox({ left: 10, top: 30, width: 1024, height: 748 }), {
    left: 262,
    top: 50,
    width: 520,
    height: 708,
  })
})

test('zoomed in a narrower area: inset 20 all round', () => {
  assert.deepEqual(expandedTextBox({ left: 0, top: 20, width: 400, height: 300 }), {
    left: 20,
    top: 40,
    width: 360,
    height: 260,
  })
})

test('zoomed in a tiny area: never under 220 either way, from the area’s top left', () => {
  assert.deepEqual(expandedTextBox({ left: 0, top: 20, width: 200, height: 150 }), {
    left: 0,
    top: 40,
    width: 220,
    height: 220,
  })
})

test('zoomed: centering leaves whole system px', () => {
  const box = expandedTextBox({ left: 0, top: 20, width: 1025, height: 748 })
  assert.equal(box.left, 252)
  for (const v of Object.values(box)) assert.ok(Number.isInteger(v), `${v} is not whole`)
})
