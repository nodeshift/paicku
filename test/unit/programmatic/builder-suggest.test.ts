import {expect} from 'chai'
import {mkdtemp, rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

import {createPaicku} from '../../../src/index.js'
import {setupFakePack} from '../../utils/fake-pack.js'

describe('paicku package - builder suggest', () => {
  let cacheDir: string
  let executablePath: string

  beforeEach(async () => {
    cacheDir = await mkdtemp(join(tmpdir(), 'paicku-builder-suggest-test-'))
    executablePath = await setupFakePack(cacheDir, 'Suggested builders:\n  - paketobuildpacks/builder:base')
  })

  afterEach(async () => {
    await rm(cacheDir, {force: true, recursive: true})
  })

  it('createPaicku().builder.suggest() returns structured result', async () => {
    const paicku = createPaicku({executablePath})
    const result = await paicku.builder.suggest()

    expect(result.failed).to.be.false
    expect(result.stdout.trim()).to.equal('Suggested builders:\n  - paketobuildpacks/builder:base')
    expect(result.command).to.include('builder suggest')
    expect(result.command).to.include('--no-color')
  })

  it('createPaicku().builder.suggest() with verbose flag', async () => {
    const paicku = createPaicku({executablePath})
    const result = await paicku.builder.suggest({
      verbose: true,
    })

    expect(result.failed).to.be.false
    expect(result.command).to.include('--verbose')
  })
})
