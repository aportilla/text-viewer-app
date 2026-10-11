# Text Viewer

The read-me application for
[SystemOnline](https://github.com/aportilla/system-online), the System 7
desktop in the browser: each text file in a window of its own, read-only, its
line breaks kept and its lines wrapped at the window, with Copy and Select
All. Use it at <https://system-online.portill.io/>: open Read Me on the
desktop.

The Text Viewer is built on the published
[**system-online-sdk**](https://www.npmjs.com/package/system-online-sdk) and
[**vintage-frames**](https://www.npmjs.com/package/vintage-frames): the SDK's
shell runs it over the kit's elements. Its release is its app file,
`Text Viewer.png`: a PNG whose picture is the Text Viewer's box and whose
chunks carry its manifest, its icon and its code. SystemOnline keeps app
files in its `apps/` and builds them in, so a release is that file copied
over. Nothing is published to npm.

```sh
npm install
npm run dev        # http://localhost:5173/
```

| Script | What it does |
| --- | --- |
| `npm run dev` | the dev desktop: the SDK's Finder with three text files on it, and the Text Viewer from its source |
| `npm run build` | the app file, `dist/Text Viewer.png`: the Text Viewer's box, with its manifest and code in the PNG's chunks |
| `npm test` | unit tests for the viewer's pure logic (`node --test`) |
| `npm run typecheck` | `tsc` over the viewer, the dev desktop and the Vite config |

The dev desktop's text files are Read Me, a built-in whose words the dev
desktop hands over as a site does; Line Breaks, with words of its own; and
Missing Text, a built-in the dev desktop doesn't ship, which can't be opened.
It starts over at each reload. `?save=1` keeps its catalog in IndexedDB and
its session in localStorage, so the open windows outlast a reload.

The packer, the box and its frame are the SDK's: `vite.config.ts` is one
call to `appFile()` from `system-online-sdk/build`, whose guide is the SDK's
[`docs/APP-FILES.md`](https://github.com/aportilla/system-online-sdk/blob/main/docs/APP-FILES.md).
The box carries the icon's stamp until the Text Viewer has artwork of its
own.

## On a site

A site builds the Text Viewer in from its app file, as it does any other
(the SDK's
[`docs/GUIDE.md`](https://github.com/aportilla/system-online-sdk/blob/main/docs/GUIDE.md)
§ Applications from app files), and hands it the texts it ships:

```ts
import textViewer from '../apps/Text Viewer.png?app'
// (key) => the words of a text the site ships, or null
import { builtinText } from './texts/index.ts'

createShell(desktop, { apps: [finder({ storage, art }), textViewer({ builtinText })] })
```

It opens the catalog's text files, kind `text`. A text file's `data` carries
its own words, `{ text }`, or names a text the site ships, `{ builtin: key }`,
whose words are always the site's: `builtinText(key)` gives them, or `null`
for a key the site doesn't ship, and opening that file says it can't be
opened. Without `builtinText`, every built-in is one of those.

## Layout

```
index.html, dev/main.ts   the dev desktop
dev/art/                  the dev desktop's Finder art, borrowed from SystemOnline
dev/texts/                the dev desktop's text files
src/app.ts                the Text Viewer's id, name, version, author and description: the manifest's source
src/index.ts              the application: its definition, its kind and its factory, the default export
src/text-file.ts          a text file: its kind, and its words, its own or a built-in's
src/layout.ts             a text window's zoomed box, the reading column
src/windows.html          a text window's markup
src/windows.ts            a text window's title and body, and the selection Copy and Select All act on
src/dialogs.html          its alert
src/dialogs.ts            the alert, asked with its message and grown to fit it
src/menus.html            its File, Edit and View menus
src/art/                  its icon, a text file's icon and the alert's art
test/                     unit tests
```
