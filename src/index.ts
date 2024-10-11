import fastify from 'fastify'
import fastifyStatic from '@fastify/static'

import { api } from './api'
import { publicDir } from './constants'

const app = fastify()

app.register(fastifyStatic, {
  root: publicDir
})

app.get('/', (req, reply) => {
  reply.sendFile('')
})

app.register((instance, options, done) => {
  api(instance)
  done()
}, { prefix: '/api' })

app.listen({ host: '127.0.0.1', port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`Server is now listening on ${address}`)
})
