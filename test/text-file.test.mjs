import { test } from 'node:test'
import assert from 'node:assert/strict'

import { textOf } from '../src/text-file.ts'

const file = (data) => ({ id: 't', name: 'Read Me', kind: 'text', parent: null, createdAt: 0, modifiedAt: 0, data })
const ships = (key) => (key === 'read-me' ? 'The words the site ships.' : null)
const none = () => null

test('a text file shows its own words, or none', () => {
  assert.equal(textOf(file({ text: 'Its own words.' }), none), 'Its own words.')
  assert.equal(textOf(file({ text: '' }), none), '')
  for (const data of [undefined, null, {}, { text: 42 }]) assert.equal(textOf(file(data), none), '')
})

test('a built-in shows the words the site ships for its key, over any of its own', () => {
  const asked = []
  const lookup = (key) => {
    asked.push(key)
    return ships(key)
  }
  assert.equal(textOf(file({ builtin: 'read-me' }), lookup), 'The words the site ships.')
  assert.equal(textOf(file({ builtin: 'read-me', text: 'Stale words.' }), lookup), 'The words the site ships.')
  assert.deepEqual(asked, ['read-me', 'read-me'])
})

test('a built-in the site doesn’t ship has no words, and no lookup ships none', () => {
  assert.equal(textOf(file({ builtin: 'gone' }), ships), null)
  assert.equal(textOf(file({ builtin: 'gone', text: 'Stale words.' }), ships), null)
  assert.equal(textOf(file({ builtin: 'read-me' }), none), null)
})

test('a key that is empty or not a string names no built-in', () => {
  assert.equal(textOf(file({ builtin: '', text: 'Its own words.' }), ships), 'Its own words.')
  assert.equal(textOf(file({ builtin: 7, text: 'Its own words.' }), ships), 'Its own words.')
})
