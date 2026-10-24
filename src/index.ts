// Text Viewer: the read-me application. It opens the catalog's text files (the
// `text` kind, text-file.ts), one window each (windows.ts), and wires its
// menus. The window manager places a window, opens it out of its icon and
// closes it back into it, retitles or closes it as its file is renamed or
// removed, and runs its zoom box, which toggles a reading column (layout.ts).
// A system document's words are the site's, fetched from its path at each
// open, so a deploy's edit shows at the next.

import { VfWindow } from 'vintage-frames'
import type { VfViewportBox } from 'vintage-frames'
import { defineApp } from 'system-online-sdk'
import type { AppDefinition, Item } from 'system-online-sdk'
import menus from './menus.html?raw'
import dialogs from './dialogs.html?raw'
import windowMarkup from './windows.html?raw'
import icon from './art/text-viewer.png'
import textArt from './art/text-file.png'
import alertArt from './art/alert.png'
import { APP } from './app.ts'
import { TEXT, faultOf, sourceOf } from './text-file.ts'
import type { Fault } from './text-file.ts'
import { ask } from './dialogs.ts'
import { bodyOf, selectContents, selectedTextIn, textWindow } from './windows.ts'
import { expandedTextBox } from './layout.ts'

export const TEXT_VIEWER = APP.id

export interface TextViewerActions {
  /** Open a text file's window, or bring it forward. Resolves once it's open,
   *  or has said why not. The boot reopens the last session's windows through
   *  it, in order. */
  open(target: { item?: string | null; from?: VfViewportBox | null }): Promise<void>
}

/** What each fault says, after the file's name. */
const SAYS: Record<Fault, string> = {
  gone: 'can’t be opened: its text is no longer part of this desktop.',
  unreachable: 'can’t be read now: its text couldn’t be reached. Try again in a moment.',
}

/** A system document's words, revalidated against the site, or why there are none. */
async function fetchWords(url: string): Promise<{ text: string } | { fault: Fault }> {
  try {
    const res = await fetch(url, { cache: 'no-cache' })
    const fault = faultOf(res.status, res.headers.get('content-type'))
    return fault ? { fault } : { text: await res.text() }
  } catch {
    return { fault: 'unreachable' }
  }
}

export function textViewer(): AppDefinition<TextViewerActions> {
  /** Opens a text file's window out of `from`; init sets it. */
  let openText = async (_item: Item, _from: VfViewportBox | null): Promise<void> => {}

  return defineApp<TextViewerActions>({
    id: TEXT_VIEWER,
    name: APP.name,
    icon,
    menus,
    dialogs,
    windows: windowMarkup,
    kinds: {
      [TEXT]: {
        art: textArt,
        open: (item, from) => void openText(item, from),
        // A system document weighs nothing: its words are the system's.
        size: (item) => {
          const source = sourceOf(item, location.href)
          return source && 'text' in source ? new TextEncoder().encode(source.text).byteLength : 0
        },
      },
    },
    init(ctx) {
      const { desktop, windows } = ctx
      const alert = ctx.dialog('alert')
      // The alert's art is the Text Viewer's own, set here: a ?raw fragment
      // can't name an imported file.
      alert.querySelector('img')!.src = alertArt

      /** Opens a text file's window with `text`, or brings its window forward. */
      const show = (item: Item, from: VfViewportBox | null, text: string): void => {
        windows.open({
          app: TEXT_VIEWER,
          item: item.id,
          from,
          create: () => textWindow(ctx.window('text'), item.name, text),
          zoom: expandedTextBox,
        })
      }
      // Not awaited: the boot's reopen goes on while the alert waits.
      const say = (item: Item, fault: Fault): void => void ask(ctx, alert, `“${item.name}” ${SAYS[fault]}`)

      openText = async (item, from) => {
        const source = sourceOf(item, location.href)
        if (source == null) return say(item, 'gone')
        if ('text' in source) return show(item, from, source.text)
        // An open window keeps the words it opened with: no fetch to bring it forward.
        if (windows.windowFor(item.id)) return show(item, from, '')
        const words = await fetchWords(source.url)
        if ('fault' in words) say(item, words.fault)
        else show(item, from, words.text)
      }

      /** The active window, when it is a text window. */
      const active = (): VfWindow | null => {
        const w = desktop.activeWindow
        return w instanceof VfWindow && windows.appOf(w) === TEXT_VIEWER ? w : null
      }

      ctx.onMenu((value) => {
        const win = active()
        if (value === 'close' && win) void windows.requestClose(win)
        else if (value === 'quit') void windows.closeAll(TEXT_VIEWER)
        // The enabled item takes ⌘C, so the browser's own copy does not run.
        else if (value === 'copy') navigator.clipboard?.writeText?.(selectedTextIn(windows, TEXT_VIEWER)).catch(() => {})
        else if (value === 'select-all' && win) selectContents(bodyOf(win))
        else if (value === 'arrange') windows.arrange()
      })
      // Copy is disabled unless a text window holds a selection, so ⌘C falls
      // through to the browser.
      ctx.gate(ctx.item('copy'), () => selectedTextIn(windows, TEXT_VIEWER) !== '')
      ctx.gate(ctx.item('arrange'), () => !windows.arranged())

      return {
        async open({ item, from = null }) {
          const it = ctx.catalog?.item(item)
          if (it?.kind === TEXT) await openText(it, from)
        },
      }
    },
  })
}

/** The app file's code exports its factory by default. */
export default textViewer
