import fastifyStatic from '@fastify/static'
import fastify from 'fastify'

import { api } from './api.js'
import { publicDir } from './constants.js'

const app = fastify()

app.register(fastifyStatic, {
  root: publicDir
})

app.get('/', (req, reply) => {
  reply.sendFile('editor/index.html')
})

app.register(
  (instance, options, done) => {
    api(instance)
    done()
  },
  { prefix: '/api' }
)

app.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`Server is now listening on ${address}`)
})
