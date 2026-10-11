// Text Viewer: the read-me application. It opens the catalog's text files (the
// `text` kind, text-file.ts), one window each (windows.ts), and wires its
// menus. The window manager places a window, opens it out of its icon and
// closes it back into it, retitles or closes it as its file is renamed or
// removed, and runs its zoom box, which toggles a reading column (layout.ts).
// A built-in's words are the site's, handed in as the factory's `builtinText`;
// without it, a built-in can't be opened.

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
import { TEXT, textOf } from './text-file.ts'
import type { BuiltinText } from './text-file.ts'
import { ask } from './dialogs.ts'
import { bodyOf, selectContents, selectedTextIn, textWindow } from './windows.ts'
import { expandedTextBox } from './layout.ts'

export const TEXT_VIEWER = APP.id

/** What a site hands the Text Viewer. */
export interface TextViewerOptions {
  /** A built-in's words by its key: the texts the site ships, which a text
   *  file names rather than carries. Null for a key it doesn't ship. */
  builtinText?: BuiltinText
}

export interface TextViewerActions {
  /** Open a text file's window, or bring it forward. The boot reopens the
   *  last session's windows through it. */
  open(target: { item?: string | null; from?: VfViewportBox | null }): void
}

export function textViewer({ builtinText = () => null }: TextViewerOptions = {}): AppDefinition<TextViewerActions> {
  /** Opens a text file's window out of `from`; init sets it. */
  let openText = (_item: Item, _from: VfViewportBox | null): void => {}

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
        open: (item, from) => openText(item, from),
        size: (item) => new TextEncoder().encode(textOf(item, builtinText) ?? '').byteLength,
      },
    },
    init(ctx) {
      const { desktop, windows } = ctx
      const alert = ctx.dialog('alert')
      // The alert's art is the Text Viewer's own, set here: a ?raw fragment
      // can't name an imported file.
      alert.querySelector('img')!.src = alertArt

      openText = (item, from) => {
        const text = textOf(item, builtinText)
        if (text == null) {
          void ask(ctx, alert, `“${item.name}” can’t be opened: its text is no longer part of this desktop.`)
          return
        }
        windows.open({
          app: TEXT_VIEWER,
          item: item.id,
          from,
          create: () => textWindow(ctx.window('text'), item.name, text),
          zoom: expandedTextBox,
        })
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
        open({ item, from = null }) {
          const it = ctx.catalog?.item(item)
          if (it?.kind === TEXT) openText(it, from)
        },
      }
    },
  })
}

/** The app file's code exports its factory by default. */
export default textViewer
