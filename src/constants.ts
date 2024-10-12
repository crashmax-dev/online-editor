import path from 'node:path'
import url from 'node:url'

export const publicDir = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  '..',
  'public'
)
