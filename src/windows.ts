// Text Viewer windows: one per open text file, a copy of windows.html's, the
// body the file's text verbatim and read-only; and the selection Copy and
// Select All act on.

import type { VfParagraph, VfWindow } from 'vintage-frames'
import type { WindowManager } from 'system-online-sdk'

/** A text window's body, whose contents Select All selects. */
export const bodyOf = (win: VfWindow) => win.querySelector('.text-body') as VfParagraph

/** `win`, a fresh text window, titled `name` and showing `text`. */
export function textWindow(win: VfWindow, name: string, text: string): VfWindow {
  win.heading = name
  bodyOf(win).textContent = text
  return win
}

/** The selected text when the selection is anchored in one of `app`'s
 *  windows, otherwise ''. */
export function selectedTextIn(windows: WindowManager, app: string): string {
  const sel = document.getSelection()
  const at = sel?.anchorNode ?? null
  const el = at instanceof Element ? at : (at?.parentElement ?? null)
  if (!sel || sel.isCollapsed || windows.appOf(el?.closest('vf-window') ?? null) !== app) return ''
  return sel.toString()
}

/** Select everything in `node`. */
export function selectContents(node: Node | null): void {
  const sel = document.getSelection()
  if (!node || !sel) return
  const range = document.createRange()
  range.selectNodeContents(node)
  sel.removeAllRanges()
  sel.addRange(range)
}
