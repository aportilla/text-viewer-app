# Text Viewer

The read-me application, an application for SystemOnline (the sibling
`system-online` repo). It runs on `system-online-sdk`'s shell over the
`vintage-frames` kit's elements, both sibling repos too. It ships as one
file, its app file `Text Viewer.png`, which SystemOnline builds in from its
`apps/`; it came out of SystemOnline's `src/apps/text-viewer/`, the third
application to leave, after Meteors and Desktop Patterns (the sibling
`meteors-app` and `desktop-patterns-app`, the models for this repo).
SystemOnline's `docs/app-packages-plan.md` held it back while its kind and
its texts were SystemOnline's alone: the `text` kind is Sprite Machine's as
well, and a site's built-in texts come in through the factory (below). The
SDK writes the file: its `system-online-sdk/build` entry holds the frame, the
packer and the `appFile()` Vite plugin, so this repo carries neither frame
nor packer. The SDK's docs (`../system-online-sdk/docs/`) are the guides:
`GUIDE.md` for an application in a repo of its own, `SHELL.md` for the shell,
`APP-FILES.md` for the format.

## Commands

- `npm run dev` — the dev desktop (`index.html`, `dev/main.ts`); `?save=1`
  keeps its catalog and session across a reload
- `npm run build` — the app file, `dist/Text Viewer.png`, through the SDK's
  `appFile()` (`vite.config.ts`). The release is that file, copied into
  SystemOnline's `apps/`
- The gates: `npm test`, `npm run typecheck`, `npm run build`. CI runs all
  three on every push and pull request.

## Tests

Unit tests only, and only for pure logic (`test/*.test.mjs`, run by
`node --test`, importing the TypeScript source through Node's type
stripping): a text file's words (`text-file.ts`) and the zoomed box
(`layout.ts`). No browser tests, and nothing that asserts markup, copy,
constants or what the kit or the SDK renders: the look and the wiring are
checked by eye, on the dev desktop. A module under test imports no DOM,
nothing of either package but `system-online-sdk/pure`, and no `?raw`, and
its relative imports carry their `.ts` extension.

## What an application in an app file relies on

The app file's code goes into a page that brings its own copy of the kit and
the SDK, so:

- **Imports**: `vintage-frames`, `system-online-sdk`,
  `system-online-sdk/pure` and its own files. It composes the kit's
  elements and brings no Lit of its own. The build leaves those three entries
  as imports, and fails on any other import, on Lit, and on CSS.
- **Art** is imported, so the build inlines it. No page paths: the alert's
  art is its own (`art/alert.png`), set on the alert in `init`, since a
  `?raw` fragment can't name an imported file.
- **Layout** sits on its own elements. No site stylesheet, and no CSS
  import: the body keeps the file's line breaks and breaks long runs by its
  own `style` (`windows.html`), as Meteors' canvas carries its own
  magnification.
- **No session keys of its own.** The session keeps its windows by their
  items. A key it adds carries its id (`text-viewer-…`), is read back
  defensively, and nothing breaks when `ctx.state` is null.
- **Nothing site-specific through the context**: no `ctx.services`, and no
  `ctx.apps`. What a site ships, its built-in texts, comes in through the
  factory's one option, `builtinText`: a site builds the Text Viewer in as
  `textViewer({ builtinText })`. Without it a built-in can't be opened, and
  the rest works on any site.
- **Its kind is `text`**, the one exception to naming its kinds after its
  id: every text file on SystemOnline's and Sprite Machine's desktops
  carries it, and an item's kind can't be changed in place. A text file's
  `data` is `{ text }`, its own words, or `{ builtin }`, a key whose words
  `builtinText` gives (`text-file.ts`). A site registers no other `text`
  kind, and a kind the Text Viewer adds is named after its id.
- **It opens from its documents.** A text file's icon, or an alias of one,
  opens the file's window through the kind's `open`, and the boot reopens
  windows through the `open` action. Its own icon is for the box and for a
  site that files one; opened with no text file, it opens nothing.
- **Its id never changes** (`text-viewer`): saved windows name it.
- **Each manifest field has one source**: `id`, `name`, `version`, `author`
  and `description` from `src/app.ts`; `requires` from the range of the
  `system-online-sdk` dev dependency, and `api` from the SDK it's built on;
  the icon from `src/art/text-viewer.png`. `package.json` carries no version
  of its own for that reason.
- **Each SDK minor** moves the `system-online-sdk` range, and
  `vintage-frames` to the range the SDK's peer dependency names, gets a look
  at the viewer on the new SDK, and a build. The Text Viewer is at 0.x: a
  minor when the range moves, a patch for the viewer alone. The SDK's
  `GUIDE.md` § Moving to a new release has the steps.

`dev/` is the dev desktop's alone and never goes into the app file; it may
borrow SystemOnline's art. Its texts (`dev/texts/`) are its own.

## Invariants — don't break, don't re-litigate

- **Never reach into the SDK's or the kit's internals.** Import their
  published entries only, never a deep path into either's `dist/`. What the
  viewer needs and they don't do is a change to them, asked for as a doc in
  `feature-requests/<name>.md`, never worked around here: in the sibling
  `system-online-sdk` repo for the shell or app files, in the sibling
  `vintage-frames` repo for an element.
- Everything is authored in **system pixels** on the 1-bit grid. A text
  window opens at 440 × 320 (`windows.html`) and zooms to a reading column at
  most 520 wide (`layout.ts`).
- `dist/` is a build output — regenerate, don't hand-edit.
- Comments are short and direct: label a section or state a non-obvious
  constraint. A larger change starts as a plan in `docs/<topic>-plan.md`.

## Commits

Concise messages: a summary line plus at most a few sentences. No co-author
or generated-by trailers.
