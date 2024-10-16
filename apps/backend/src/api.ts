import fs from 'node:fs/promises'
import path from 'node:path'
import { build } from 'vite'
import { publicDir } from './constants.js'

import type { FastifyInstance } from 'fastify'

interface FileData {
  name: string
  source: string
}

const SchemaFileData = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    source: { type: 'string' },
  },
  required: ['name', 'source'],
  additionalProperties: false,
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
    },
  )
}

function getInputFiles() {
  return fs.readdir(path.resolve(publicDir, 'input'), {
    encoding: 'utf8',
    recursive: true,
  })
}

async function readFiles() {
  const inputFiles = await getInputFiles()
  const files: FileData[] = []

  for (const fileName of inputFiles) {
    const filePath = path.resolve(publicDir, 'input', fileName)
    const fileStat = await fs.stat(filePath)
    if (fileStat.isDirectory()) continue

    const fileData = await fs.readFile(filePath, 'utf8')
    files[fileName === 'index.js' ? 'unshift' : 'push']({
      name: fileName,
      source: fileData,
    })
  }

  return files
}

async function writeFiles(files: FileData[]) {
  performance.mark('build-start')

  const allowedFiles = await getInputFiles()

  for (const file of files) {
    if (!allowedFiles.includes(file.name)) {
      throw new Error(`File "${file.name}" does not exist`)
    }

    const filePath = path.resolve(publicDir, 'input', file.name)
    await fs.writeFile(filePath, file.source, 'utf8')
  }

  return await buildProject()
}

async function buildProject() {
  const output = await build({
    root: path.resolve(publicDir, 'input'),
    logLevel: 'silent',
    // cacheDir: path.resolve(publicDir, 'input', '.cache'),
    build: {
      emptyOutDir: true,
      target: 'esnext',
      outDir: path.resolve(publicDir, 'output'),
      lib: {
        entry: 'index.js',
        name: 'output',
        formats: ['iife'],
        fileName: () => 'index.js',
      },
    },
  })

  performance.mark('build-end')
  const perf = performance.measure('build', 'build-start', 'build-end')

  const buildMeta = {
    bundleSize: 0,
    modulesTransformed: 0,
    time: Math.floor(perf.duration),
  }

  if (Array.isArray(output)) {
    for (const chunk of output) {
      for (const file of chunk.output) {
        if ('modules' in file) {
          buildMeta.bundleSize += file.code.length
          buildMeta.modulesTransformed += Object.keys(file.modules).length
        } else if ('source' in file) {
          buildMeta.bundleSize += file.source.length
        }
      }
    }
  }

  return buildMeta
}
