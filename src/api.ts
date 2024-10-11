import path from 'node:path'
import fs from 'node:fs/promises'
import { publicDir } from './constants'
import { build } from 'vite'

import type { FastifyInstance } from 'fastify'

interface FileData {
  name: string
  source: string
}

const SchemaFileData = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    source: { type: 'string' }
  },
  required: ['name', 'source'],
  additionalProperties: false
}

export function api(fastify: FastifyInstance) {
  fastify.get('/files', async (req, reply) => {
    const files = await readFiles()
    reply.send(files)
  })

  fastify.post<{ Body: FileData[] }>(
    '/files',
    { schema: { body: { type: 'array', items: SchemaFileData } } },
    async (req, reply) => {
      const res = await writeFiles(req.body)
      reply.send(res)
    }
  )
}

async function readFiles() {
  const fileNames = await fs.readdir(path.resolve(publicDir, 'input'), {
    encoding: 'utf8',
    recursive: true
  })

  const files: FileData[] = []

  for (const fileName of fileNames) {
    const filePath = path.resolve(publicDir, 'input', fileName)
    const fileStat = await fs.stat(filePath)
    if (fileStat.isDirectory()) continue

    const fileData = await fs.readFile(filePath, 'utf8')
    files[fileName === 'index.js' ? 'unshift' : 'push']({
      name: fileName,
      source: fileData
    })
  }

  return files
}

async function writeFiles(files: FileData[]) {
  const allowedFileNames = await fs.readdir(path.resolve(publicDir, 'input'), {
    encoding: 'utf8',
    recursive: true
  })

  for (const file of files) {
    if (!allowedFileNames.includes(file.name)) {
      throw new Error(`File "${file.name}" does not exist`)
    }

    const filePath = path.resolve(publicDir, 'input', file.name)
    await fs.writeFile(filePath, file.source, 'utf8')
  }

  return await buildProject()
}

async function buildProject() {
  performance.mark('build-start')

  await build({
    root: path.resolve(publicDir, 'input'),
    logLevel: 'silent',
    publicDir: 'public',
    build: {
      copyPublicDir: true,
      emptyOutDir: false,
      target: 'esnext',
      outDir: path.resolve(publicDir, 'output'),
      lib: {
        entry: 'index.js',
        name: 'output',
        formats: ['iife'],
        fileName: () => 'index.js'
      },
    },
  })

  performance.mark('build-end')
  const perf = performance.measure('build', 'build-start', 'build-end')
  return { time: Math.floor(perf.duration) }
}
