import {config, expect} from 'chai'
import {execa} from 'execa'
import {it} from 'mocha'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {createPaicku} from '../../../../../src/index.js'

config.truncateThreshold = 0

const TEST_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const testDataPath = path.join(TEST_DIR, 'testdata/nodejs_simple_app')
const port = 8080

describe('programmatic API build (podman)', () => {
  it('should build a Nodejs app', async () => {
    const paicku = createPaicku()

    const {envsForRun, failed, imageName, stdout} = await paicku.build({
      builder: 'docker.io/paketobuildpacks/builder-jammy-base',
      'container-runtime': 'podman',
      path: testDataPath,
    })

    expect(failed).to.be.false
    expect(stdout.join('\n')).to.contain(`Successfully built image '${imageName}'`)

    const inspectResult = await paicku.inspect(imageName, {output: 'json'})
    expect(inspectResult.failed).to.be.false
    expect(inspectResult.parsedStdout).to.not.be.null

    let started
    try {
      started = await paicku.start({
        envsForRun,
        imageName,
        port,
      })

      const response = await fetch(started.url)
      expect(response.status).to.equal(200)
      expect(await response.text()).to.equal('hello world')
    } finally {
      if (started) {
        await started.stop()
      }

      await execa('podman', ['rmi', imageName], {reject: false})
    }
  })
})
