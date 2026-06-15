import {expect} from 'chai'
import {mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

import {createPaicku} from '../../../src/index.js'
import {setupFakePack} from '../../utils/fake-pack.js'

describe('paicku package', () => {
  let cacheDir: string
  let executablePath: string

  beforeEach(async () => {
    cacheDir = await mkdtemp(join(tmpdir(), 'paicku-inspect-test-'))
    executablePath = await setupFakePack(cacheDir, '{"remote":null,"local":null}')
  })

  afterEach(async () => {
    await rm(cacheDir, {force: true, recursive: true})
  })

  it('createPaicku().inspect returns structured result', async () => {
    const paicku = createPaicku({executablePath})
    const result = await paicku.inspect('my-image', {
      bom: true,
      output: 'json',
    })

    expect(result.failed).to.be.false
    expect(result.stdout.trim()).to.equal('{"remote":null,"local":null}')
    expect(result.parsedStdout).to.deep.equal({local: null, remote: null})
    expect(result.command).to.include('--bom')
    expect(result.command).to.include('--no-color')
  })

  it('createPaicku().inspect parses pack inspect json output', async () => {
    const inspectJson = `{
  "image_name": "yarn-simple-app:latest",
  "remote_info": null,
  "local_info": {
    "stack": "io.buildpacks.stacks.jammy",
    "base_image": {
      "top_layer": "sha256:383ff43015e6faae08ac0f0f8bd8e2400d59a63eeff8290ab1e6255e2f4e1a93",
      "reference": "1389e28a5583d5fb2bae390dd79402ae3271d9ee2c791236e00a6c3168746592"
    },
    "run_images": [
      {
        "name": "docker.io/paketobuildpacks/run-jammy-base:latest"
      }
    ],
    "buildpacks": [
      {
        "id": "paketo-buildpacks/node-engine",
        "version": "8.0.12",
        "homepage": "https://github.com/paketo-buildpacks/node-engine"
      },
      {
        "id": "paketo-buildpacks/yarn",
        "version": "2.2.27",
        "homepage": "https://github.com/paketo-buildpacks/yarn"
      },
      {
        "id": "paketo-buildpacks/yarn-install",
        "version": "2.7.10",
        "homepage": "https://github.com/paketo-buildpacks/yarn-install"
      },
      {
        "id": "paketo-community/build-plan",
        "version": "0.3.21"
      }
    ],
    "extensions": null,
    "processes": null,
    "rebasable": true
  }
}`
    const inspectData = JSON.parse(inspectJson)
    const packPath = await setupFakePack(cacheDir, JSON.stringify(inspectData))
    const paicku = createPaicku({executablePath: packPath})
    const result = await paicku.inspect('yarn-simple-app:latest', {
      output: 'json',
    })

    expect(result.failed).to.be.false
    expect(result.stdout.trim()).to.equal(JSON.stringify(inspectData))
    expect(result.parsedStdout).to.deep.equal(inspectData)
    expect(result.command).to.include('inspect yarn-simple-app:latest')
  })
})
