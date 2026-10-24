// A text file: the catalog kind the Text Viewer opens, and where its words are
// (pure). A text file keeps little in its item's `data`: its own words, or the
// path of a system document, a text the site serves, whose words are always
// the site's.

import type { Item } from 'system-online-sdk/pure'

/**
 * A text file's kind. Older than the rule that names an application's kinds
 * after its id: every text file on SystemOnline's and Sprite Machine's
 * desktops carries it, and an item's kind can't be changed in place.
 */
export const TEXT = 'text'

/** A text file's data: a system document's path, or its own words. */
export interface TextData {
  path?: string
  text?: string
}

/**
 * Where a text file's words are: its own, or a system document's, at `url` on
 * the page's origin. Null for words it can't open.
 */
export type TextSource = { text: string } | { url: string } | null

/**
 * A text file's source, `page` the page's address. A path is resolved against
 * the page and opens only on its origin, so a document can't send the Text
 * Viewer elsewhere. A key of a built-in, from before system documents had
 * paths, opens nothing, and neither does a path off the origin. Otherwise its
 * own words, '' when it has none.
 */
export function sourceOf(item: Item, page: string): TextSource {
  const d = (item.data ?? {}) as TextData & { builtin?: unknown }
  if (typeof d.path === 'string' && d.path) return onPage(d.path, page)
  if (typeof d.builtin === 'string' && d.builtin) return null
  return { text: typeof d.text === 'string' ? d.text : '' }
}

function onPage(path: string, page: string): TextSource {
  try {
    const base = new URL(page)
    const url = new URL(path, base)
    // The protocol too: a blob: URL carries its creator's origin.
    return url.origin === base.origin && url.protocol === base.protocol ? { url: url.href } : null
  } catch {
    return null
  }
}

/** Why a system document's fetch gave no words: no longer served, or not now. */
export type Fault = 'gone' | 'unreachable'

/**
 * What a system document's response means: null for its words, else why there
 * are none. A 404 or 410 is a path the site no longer serves, and so is a
 * page, since a host that falls back to its index answers any path with it.
 * Anything else not ok can't be read now.
 */
export function faultOf(status: number, type: string | null): Fault | null {
  if (status === 404 || status === 410) return 'gone'
  if (status < 200 || status > 299) return 'unreachable'
  return type != null && /^\s*text\/html\b/i.test(type) ? 'gone' : null
}
