// The Text Viewer as its app file names it. The manifest's id, name, version,
// author and description come from here, and index.ts takes its id and name
// from it, so the two can't drift. The id never changes: saved windows name
// it.

export const APP = {
  id: 'text-viewer',
  name: 'Text Viewer',
  version: '0.2.0',
  author: 'Adam Portilla',
  description: 'The read-me application: each text file in a window of its own, read-only, its line breaks kept.',
} as const
