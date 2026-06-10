import {runCommand} from '@oclif/test'
import {expect} from 'chai'
import {chmod, mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

import ghServer from './../../../mocks/githubServer/server'

async function setupFakePack(dir: string): Promise<void> {
  const packPath = join(dir, 'pack')
  await writeFile(packPath, `#!/bin/sh\nprintf '%s\\n' 'inspect my-image --output human-readable'\n`)
  await chmod(packPath, 0o755)
}

describe('inspect', () => {
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
    await setupFakePack(tempDir)
  })

  afterEach(async () => {
    await rm(tempDir, {force: true, recursive: true})
  })

  it('runs inspect IMAGENAME', async () => {
    const {error} = await runCommand('inspect my-image')
    expect(error).to.be.undefined
  })

  it('runs inspect --help', async () => {
    const {stdout} = await runCommand('inspect my-image --help')
    expect(stdout).to.contain('Show information about a built app image')
  })
})
