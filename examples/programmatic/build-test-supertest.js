import path from 'node:path'
import {fileURLToPath} from 'node:url'
import request from 'supertest'

import {createPaicku} from '../../dist/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appPath = path.join(__dirname, '../../test/integration/testdata/nodejs_simple_app')
const appPort = 8080

const paicku = createPaicku()

const containerImage = await paicku.build({
  builder: 'docker.io/paketobuildpacks/ubuntu-noble-builder',
  imageName: 'my-image-name',
  path: appPath,
})

const container = await containerImage.run({exposedPorts: appPort})

try {
  const response = await request(container.getUrl()).get('/').expect(200)
  console.log(response.text)
} finally {
  console.log('Stopping container...')
  await container.stop()
}
