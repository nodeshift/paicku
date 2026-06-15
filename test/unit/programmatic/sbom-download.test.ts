import {expect} from 'chai'
import {mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

import {createPaicku} from '../../../src/index.js'
import {setupFakePack} from '../../utils/fake-pack.js'

describe('paicku package - sbom download', () => {
  let cacheDir: string
  let executablePath: string

  beforeEach(async () => {
    cacheDir = await mkdtemp(join(tmpdir(), 'paicku-sbom-download-test-'))
    executablePath = await setupFakePack(cacheDir, 'SBOM downloaded successfully')
  })

  afterEach(async () => {
    await rm(cacheDir, {force: true, recursive: true})
  })

  it('createPaicku().sbom.download() returns structured result', async () => {
    const paicku = createPaicku({executablePath})
    const result = await paicku.sbom.download('my-image')

    expect(result.failed).to.be.false
    expect(result.stdout.trim()).to.equal('SBOM downloaded successfully')
    expect(result.command).to.include('sbom download my-image')
    expect(result.command).to.include('--no-color')
  })

  it('createPaicku().sbom.download() with output-dir flag', async () => {
    const paicku = createPaicku({executablePath})
    const result = await paicku.sbom.download('my-image', {
      'output-dir': '/tmp/sbom',
    })

    expect(result.failed).to.be.false
    expect(result.command).to.include('--output-dir')
    expect(result.command).to.include('/tmp/sbom')
  })
})
