import {expect} from 'chai'
import {after, before, describe, it} from 'mocha'
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import request from 'supertest'

import {createPaicku} from '../../dist/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const appPath = path.join(__dirname, '../../test/integration/testdata/nodejs_simple_app')
const appPort = 8080

describe('Build and Run a Node.js App', () => {
  const paicku = createPaicku()

  let containerImage
  let container

  before(async () => {
    containerImage = await paicku.build({
      builder: 'docker.io/paketobuildpacks/ubuntu-noble-builder',
      path: appPath,
    })
  })

  after(async () => {
    if (container) {
      await container.stop()
    }
  })

  it('should successfully build, start, and serve the application', async () => {
    container = await containerImage.run({exposedPorts: appPort})

    const response = await request(container.getUrl()).get('/')

    expect(response.status).to.equal(200)
    expect(response.text).to.equal('hello world')
  })
})


/**
 * We will have one pack run command which practically will have the same arguments as
 * build and some extra argument (if necessary) for running the container.
 * 
 * We will have the build command that will also export the variables that you need
 * in order to run your container.
 * 
 * For the programmatic, we will have an image object that someone can run it.
 * 
 */