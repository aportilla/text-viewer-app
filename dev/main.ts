// The dev desktop: the SDK's shell over index.html's desktop, with the SDK's
// Finder and the Text Viewer from its source. The Finder's art is
// SystemOnline's, borrowed (dev/art/).
//
// The seed puts three text files on the desktop: Read Me, a built-in whose
// words are the dev desktop's (dev/texts/), handed to the Text Viewer as a
// site hands it its own; Line Breaks, with words of its own; and Missing Text,
// a built-in the dev desktop doesn't ship, which can't be opened.
//
// The catalog is in memory and there is no session, so a reload starts over.
// ?save=1 keeps the catalog in IndexedDB and the session in localStorage, so
// the icons' places and the open windows outlast a reload.

import 'vintage-frames'
import { applyCursor } from 'vintage-frames'
import type { VfDesktop } from 'vintage-frames'
import { createShell, finder, indexedDbStorage, localStorageState, memoryStorage } from 'system-online-sdk'
import { textViewer } from '../src/index.ts'
import { TEXT } from '../src/text-file.ts'
import readMe from './texts/read-me.txt?raw'
import lineBreaks from './texts/line-breaks.txt?raw'
import folderArt from './art/folder.png'
import trashArt from './art/trash.png'
import trashFullArt from './art/trash-full.png'
import trashMarkArt from './art/trash-indicator.png'
import documentArt from './art/text-file.png'
import cautionArt from './art/alert.png'

/** The dev desktop's built-in texts, by key. */
const BUILTINS = new Map([['read-me', readMe]])

const save = new URLSearchParams(location.search).get('save') === '1'
const desktop = document.getElementById('desktop') as VfDesktop

const removeCursor = applyCursor()

const shell = createShell(desktop, {
  apps: [
    finder({
      storage: save ? indexedDbStorage('text-viewer-app') : memoryStorage(),
      art: {
        folder: folderArt,
        trash: trashArt,
        trashFull: trashFullArt,
        trashMark: trashMarkArt,
        document: documentArt,
        caution: cautionArt,
      },
      seed: async (catalog) => {
        await catalog.create({ kind: TEXT, name: 'Read Me', data: { builtin: 'read-me' } })
        await catalog.create({ kind: TEXT, name: 'Line Breaks', data: { text: lineBreaks } })
        await catalog.create({ kind: TEXT, name: 'Missing Text', data: { builtin: 'missing-text' } })
      },
    }),
    textViewer({ builtinText: (key) => BUILTINS.get(key) ?? null }),
  ],
  fit: 'viewport',
  state: save ? localStorageState('text-viewer-app:desktop') : null,
})

// HMR teardown. Vite re-runs this module without unloading the old instance,
// so everything wired above is disposed.
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    shell.dispose()
    removeCursor()
  })
}
