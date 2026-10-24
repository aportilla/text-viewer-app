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
chunks carry its manifest, its icon and its code. A release is that file,
signed and published to SystemOnline's index of app files, which SystemOnline
installs it from. Nothing is published to npm.

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

The dev desktop's text files are Read Me, a system document whose words the
dev server serves at its path, as a site serves its own; Line Breaks, with
words of its own; and Missing Text, a path the dev desktop doesn't serve,
which can't be opened. It starts over at each reload. `?save=1` keeps its catalog in IndexedDB and
its session in localStorage, so the open windows outlast a reload.

The packer, the box and its frame are the SDK's: `vite.config.ts` is one
call to `appFile()` from `system-online-sdk/build`, whose guide is the SDK's
[`docs/APP-FILES.md`](https://github.com/aportilla/system-online-sdk/blob/main/docs/APP-FILES.md).
The box carries the icon's stamp until the Text Viewer has artwork of its
own.

## On a site

A site installs the Text Viewer from its app file, as it does any other (the
SDK's
[`docs/GUIDE.md`](https://github.com/aportilla/system-online-sdk/blob/main/docs/GUIDE.md)),
and hands it nothing. It opens the catalog's text files, kind `text`. A text
file's `data` is one of two:

- `{ text }`: its own words, a visitor's.
- `{ path }`: a system document, a text the site ships, such as a Read Me,
  whose words are always the site's. The path is on the page's own origin
  (`/texts/read-me.txt`), served where the site likes, and the Text Viewer
  fetches it at each open, revalidating, so a deploy's edit shows at the
  next. A path on another origin opens nothing. A path the site no longer
  serves says its text is no longer part of this desktop, and a document
  it can't reach, offline say, that it can't be read now. It weighs nothing
  in the Trash.

```ts
await catalog.create({ kind: 'text', name: 'Read Me', data: { path: '/texts/read-me.txt' } })
```

Before 0.3.0 a site handed the Text Viewer its texts, `textViewer({
builtinText })`, and a text file named one by its key, `{ builtin }`. A key
opens nothing now: a site moving to 0.3.0 rewrites each to its path.

## Layout

```
index.html, dev/main.ts   the dev desktop
dev/art/                  the dev desktop's Finder art, borrowed from SystemOnline
dev/texts/                the dev desktop's text files
src/app.ts                the Text Viewer's id, name, version, author and description: the manifest's source
src/index.ts              the application: its definition, its kind and its factory, the default export
src/text-file.ts          a text file: its kind, where its words are, and what a document's response means
src/layout.ts             a text window's zoomed box, the reading column
src/windows.html          a text window's markup
src/windows.ts            a text window's title and body, and the selection Copy and Select All act on
src/dialogs.html          its alert
src/dialogs.ts            the alert, asked with its message and grown to fit it
src/menus.html            its File, Edit and View menus
src/art/                  its icon, a text file's icon and the alert's art
test/                     unit tests
```
