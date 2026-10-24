// The dev desktop: the SDK's shell over index.html's desktop, with the SDK's
// Finder and the Text Viewer from its source. The Finder's art is
// SystemOnline's, borrowed (dev/art/).
//
// The seed puts three text files on the desktop: Read Me, a system document
// whose words the dev server serves at its path, as a site serves its own;
// Line Breaks, with words of its own; and Missing Text, a path the dev desktop
// doesn't serve, which can't be opened.
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
import lineBreaks from './texts/line-breaks.txt?raw'
import folderArt from './art/folder.png'
import trashArt from './art/trash.png'
import trashFullArt from './art/trash-full.png'
import trashMarkArt from './art/trash-indicator.png'
import documentArt from './art/text-file.png'
import cautionArt from './art/alert.png'

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
        // Vite serves the project's files at their paths.
        await catalog.create({ kind: TEXT, name: 'Read Me', data: { path: '/dev/texts/read-me.txt' } })
        await catalog.create({ kind: TEXT, name: 'Line Breaks', data: { text: lineBreaks } })
        await catalog.create({ kind: TEXT, name: 'Missing Text', data: { path: '/dev/texts/missing-text.txt' } })
      },
    }),
    textViewer(),
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
