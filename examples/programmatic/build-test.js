import path from 'node:path'
import {fileURLToPath} from 'node:url'

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

const started = await containerImage.run({exposedPorts: appPort})

try {
  const response = await fetch(started.getUrl())
  const body = await response.text()
  console.log(body)

  if (response.status !== 200) {
    throw new Error(`Expected status 200 for ${started.getUrl()}, got ${response.status}`)
  }
} finally {
  console.log('Stopping container...')
  await started.stop()
}
