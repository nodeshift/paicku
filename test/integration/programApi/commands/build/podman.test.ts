import {config, expect} from 'chai'
import {execa} from 'execa'
import {it} from 'mocha'
import path from 'node:path'
import {type Readable} from 'node:stream'
import {fileURLToPath} from 'node:url'

import {createPaicku} from '../../../../../src/index.js'

config.truncateThreshold = 0

const TEST_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const testDataPath = path.join(TEST_DIR, 'testdata/nodejs_simple_app')
const exposedPorts = 8080

describe('programmatic API build (podman)', () => {
  it('should build a Nodejs app', async () => {
    const paicku = createPaicku()

    const containerImage = await paicku.build({
      builder: 'docker.io/paketobuildpacks/builder-jammy-base',
      'container-runtime': 'podman',
      path: testDataPath,
    })

    expect(containerImage.stdout.join('\n')).to.contain(`Successfully built image '${containerImage.imageName}'`)

    const inspectResult = await paicku.inspect(containerImage.imageName, {'container-runtime': 'podman', output: 'json'})
    expect(inspectResult.parsedStdout).to.not.be.null

    let container
    try {
      container = await containerImage.run({exposedPorts})

      const response = await fetch(container.url)
      expect(response.status).to.equal(200)
      expect(await response.text()).to.equal('hello world')

      expect(container.logs).to.be.a('function')

      const stream = (await container.logs()) as Readable
      const logOutput = await new Promise<string>((resolve) => {
        let output = ''
        const timeout = setTimeout(() => {
          stream.destroy()
          resolve(output)
        }, 3000)

        stream
          .on('data', (line) => {
            output += line.toString()
          })
          .on('err', (line) => {
            output += line.toString()
          })
          .on('end', () => {
            clearTimeout(timeout)
            resolve(output)
          })
      })
      expect(logOutput).to.contain('server is listening on')
    } finally {
      if (container) {
        await container.stop()
      }

      await execa('podman', ['rmi', containerImage.imageName], {reject: false})
    }
  })
})
