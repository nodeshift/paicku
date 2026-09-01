import {expect} from 'chai'
import {chmod, mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

import {PaickuError, createPaicku} from '../../../src/index.js'

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
      expect(error).to.be.instanceOf(PaickuError)
      const paickuError = error as PaickuError
      expect(paickuError.message).to.include('must be prefixed with a registry')
      expect(paickuError.exitCode).to.equal(1)
      expect(paickuError.command).to.be.undefined
      expect(paickuError.warnings.some((message) => message.includes('container runtime'))).to.be.true
    }
  })

  it('paicku().build throws PaickuError with pack output when pack fails', async () => {
    const packPath = join(cacheDir, 'pack-fail')
    await writeFile(
      packPath,
      String.raw`#!/bin/sh
printf '%s\n' "starting build"
printf '%s\n' "ERROR: failed to build" >&2
exit 7
`,
    )
    await chmod(packPath, 0o755)

    const paicku = createPaicku({executablePath: packPath})

    try {
      await paicku.build({
        builder: 'docker.io/paketobuildpacks/builder-ubi8-base',
        imageName: 'my-image',
        path: '/path/to/app',
      })
      expect.fail('Expected build to throw')
    } catch (error) {
      expect(error).to.be.instanceOf(PaickuError)
      const paickuError = error as PaickuError
      expect(paickuError.exitCode).to.equal(7)
      expect(paickuError.command).to.include('build my-image')
      expect(paickuError.stdout.some((message) => message.includes('starting build'))).to.be.true
      expect(paickuError.stderr.some((message) => message.includes('ERROR: failed to build'))).to.be.true
      expect(paickuError.message).to.include('Build failed. (exit code 7)')
      expect(paickuError.message).to.not.include('ERROR: failed to build')
    }
  })
})
