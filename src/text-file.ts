// A text file: the catalog kind the Text Viewer opens, and its words (pure). A
// text file keeps little in its item's `data`: its own words, or the key of a
// built-in, a text the site ships, whose words are always the site's.

import type { Item } from 'system-online-sdk/pure'

/**
 * A text file's kind. Older than the rule that names an application's kinds
 * after its id: every text file on SystemOnline's and Sprite Machine's
 * desktops carries it, and an item's kind can't be changed in place.
 */
export const TEXT = 'text'

/** A text file's data: the key of a built-in, or its own words. */
export interface TextData {
  builtin?: string
  text?: string
}

/** A built-in's words by its key, or null for a key the site doesn't ship. */
export type BuiltinText = (key: string) => string | null

/**
 * A text file's words: a built-in's from `builtinText`, else its own, '' when
 * it has none. Null for a built-in `builtinText` doesn't give.
 */
export function textOf(item: Item, builtinText: BuiltinText): string | null {
  const d = (item.data ?? {}) as TextData
  if (typeof d.builtin === 'string' && d.builtin) return builtinText(d.builtin)
  return typeof d.text === 'string' ? d.text : ''
}
