import { defineConfig } from 'vite'
import { appFile } from 'system-online-sdk/build'
import { APP } from './src/app.ts'

// `npm run dev` serves the dev desktop (index.html, dev/main.ts). `npm run
// build` writes the Text Viewer's app file, dist/Text Viewer.png: the SDK
// builds the code, checks it keeps to an app file's rules, and packs it with
// the manifest into its box. No artwork yet, so the box carries the icon's
// stamp.
export default defineConfig({
  plugins: [appFile({ app: APP, entry: 'src/index.ts', icon: 'src/art/text-viewer.png' })],
})
