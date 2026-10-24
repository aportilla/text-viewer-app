import { test } from 'node:test'
import assert from 'node:assert/strict'

import { faultOf, sourceOf } from '../src/text-file.ts'

const file = (data) => ({ id: 't', name: 'Read Me', kind: 'text', parent: null, createdAt: 0, modifiedAt: 0, data })
const PAGE = 'https://system-online.portill.io/?fresh=1'
const source = (data) => sourceOf(file(data), PAGE)

test('a text file shows its own words, or none', () => {
  assert.deepEqual(source({ text: 'Its own words.' }), { text: 'Its own words.' })
  assert.deepEqual(source({ text: '' }), { text: '' })
  for (const data of [undefined, null, {}, { text: 42 }]) assert.deepEqual(source(data), { text: '' })
})

test('a system document’s path opens on the page’s origin, over any words of its own', () => {
  const url = { url: 'https://system-online.portill.io/texts/read-me.txt' }
  assert.deepEqual(source({ path: '/texts/read-me.txt' }), url)
  assert.deepEqual(source({ path: 'texts/read-me.txt' }), url)
  assert.deepEqual(source({ path: '/texts/read-me.txt', text: 'Stale words.' }), url)
  assert.deepEqual(sourceOf(file({ path: 'read-me.txt' }), 'https://example.com/desk/'), {
    url: 'https://example.com/desk/read-me.txt',
  })
})

test('a path off the page’s origin opens nothing', () => {
  for (const path of [
    'https://elsewhere.example/read-me.txt',
    '//elsewhere.example/read-me.txt',
    '\\\\elsewhere.example\\read-me.txt',
    'http://system-online.portill.io/texts/read-me.txt',
    'https://system-online.portill.io:8443/texts/read-me.txt',
    'blob:https://system-online.portill.io/0b9f',
    'data:text/plain,Words',
    'javascript:alert(1)',
  ]) {
    assert.equal(source({ path, text: 'Its own words.' }), null, path)
  }
  assert.equal(sourceOf(file({ path: '/texts/read-me.txt' }), 'not a page'), null)
})

test('a built-in’s key, from before paths, opens nothing', () => {
  assert.equal(source({ builtin: 'read-me' }), null)
  assert.equal(source({ builtin: 'read-me', text: 'Stale words.' }), null)
  assert.deepEqual(source({ builtin: 'read-me', path: '/texts/read-me.txt' }), {
    url: 'https://system-online.portill.io/texts/read-me.txt',
  })
})

test('a path or key that is empty or not a string names nothing', () => {
  assert.deepEqual(source({ path: '', text: 'Its own words.' }), { text: 'Its own words.' })
  assert.deepEqual(source({ path: 7, text: 'Its own words.' }), { text: 'Its own words.' })
  assert.deepEqual(source({ builtin: '', text: 'Its own words.' }), { text: 'Its own words.' })
  assert.deepEqual(source({ builtin: 7 }), { text: '' })
})

test('a document’s words are a success that isn’t a page', () => {
  assert.equal(faultOf(200, 'text/plain; charset=utf-8'), null)
  assert.equal(faultOf(200, 'text/markdown'), null)
  assert.equal(faultOf(200, null), null)
  assert.equal(faultOf(203, 'text/plain'), null)
})

test('a path the site no longer serves is gone, its index fallback included', () => {
  assert.equal(faultOf(404, 'text/plain'), 'gone')
  assert.equal(faultOf(410, null), 'gone')
  assert.equal(faultOf(200, 'text/html; charset=utf-8'), 'gone')
  assert.equal(faultOf(200, ' Text/HTML'), 'gone')
})

test('any other failure can’t be read now', () => {
  for (const status of [0, 304, 403, 429, 500, 503]) assert.equal(faultOf(status, 'text/plain'), 'unreachable', String(status))
})
