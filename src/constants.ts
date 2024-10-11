import url from 'node:url'
import path from 'node:path'

export const publicDir = path.resolve(
  path.dirname(url.fileURLToPath(import.meta.url)),
  '..', 'public'
)
