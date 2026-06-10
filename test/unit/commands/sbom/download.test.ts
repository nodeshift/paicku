import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import {mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

import {setupFakePack} from '../../../utils/fake-pack.js'
import ghServer from './../../../mocks/githubServer/server'

describe('download pack hook', () => {
  let tempDir: string

  before(() => {
    ghServer.listen(3003, () => {})
  })

  after((done) => {
    ghServer.close(done)
  })

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'paicku-test-'))
    process.env.PAICKU_CACHE_DIR = tempDir
    process.env.PAICKU_GITHUB_BASE_URL = 'http://localhost:3003'
    process.env.PAICKU_PACK_VERSION = '0.0.1'
    await setupFakePack(tempDir, 'sbom download image-name --output-dir .')
  })

  afterEach(async () => {
    await rm(tempDir, {force: true, recursive: true})
  })

  it('runs sbom', async () => {
    const {stdout} = await runCommand('sbom')
    expect(stdout).to.contain('$ paicku sbom COMMAND')
  })

  it('runs sbom download IMAGENAME', async () => {
    const {error} = await runCommand('sbom download image-name')
    expect(error).to.be.undefined
  })
})
