import {expect} from 'chai'
import {chmod, mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

import {createPaicku} from '../../../src/index.js'

async function setupFakeBuildPack(dir: string): Promise<string> {
  const packPath = join(dir, 'pack')
  await writeFile(
    packPath,
    String.raw`#!/bin/sh
if [ "$1" = "build" ]; then
  printf '%s\n' "Successfully built image '$2'"
else
  printf '%s\n' "unexpected command: $1"
fi
`,
  )
  await chmod(packPath, 0o755)
  return packPath
}

describe('paicku package - build', () => {
  let cacheDir: string
  let executablePath: string

  beforeEach(async () => {
    cacheDir = await mkdtemp(join(tmpdir(), 'paicku-build-test-'))
    executablePath = await setupFakeBuildPack(cacheDir)
  })

  afterEach(async () => {
    await rm(cacheDir, {force: true, recursive: true})
  })

  it('paicku().build returns structured result', async () => {
    const paicku = createPaicku({executablePath})
    const containerImage = await paicku.build({
      builder: 'docker.io/paketobuildpacks/builder-ubi8-base',
      imageName: 'my-image',
      path: '/path/to/app',
    })

    expect(containerImage.run).to.be.a('function')
    expect(containerImage.stdout.at(-1)?.trim()).to.equal("Successfully built image 'my-image'")
    expect(containerImage.imageName).to.equal('my-image')
    expect(containerImage.command).to.include('build my-image')
    expect(containerImage.command).to.include('--no-color')
  })

  it('paicku().build collects logs in separate arrays', async () => {
    const paicku = createPaicku({executablePath})

    const containerImage = await paicku.build({
      builder: 'docker.io/paketobuildpacks/builder-ubi8-base',
      imageName: 'my-image',
      path: '/path/to/app',
    })

    expect(containerImage.stdout.some((message) => message.includes('Building image my-image'))).to.be.true
    expect(containerImage.warnings.some((message) => message.includes('container runtime'))).to.be.true
  })

  it('paicku().build collects error logs when builder lacks registry prefix', async () => {
    const paicku = createPaicku({executablePath})

    try {
      await paicku.build({
        builder: 'paketobuildpacks/builder-ubi8-base',
        imageName: 'my-image',
        path: '/path/to/app',
      })
      expect.fail('Expected build to throw')
    } catch (error) {
      expect((error as Error).message).to.include('must be prefixed with a registry')
    }
  })
})
