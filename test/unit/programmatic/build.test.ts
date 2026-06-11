import {expect} from 'chai'
import {chmod, mkdtemp, rm, writeFile} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import {join} from 'node:path'

import {createPaicku} from '../../../src/index.js'

async function setupFakeBuildPack(dir: string): Promise<string> {
  const packPath = join(dir, 'pack')
  await writeFile(
    packPath,
    `#!/bin/sh
if [ "$1" = "build" ]; then
  printf '%s\\n' "Successfully built image '$2'"
else
  printf '%s\\n' "unexpected command: $1"
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

  it('createPaicku().build returns structured result', async () => {
    const paicku = createPaicku({executablePath})
    const result = await paicku.build('my-image', {
      builder: 'docker.io/paketobuildpacks/builder-ubi8-base',
      path: '/path/to/app',
    })

    expect(result.failed).to.be.false
    expect(result.stdout.at(-1)?.trim()).to.equal("Successfully built image 'my-image'")
    expect(result.imageName).to.equal('my-image')
    expect(result.command).to.include('build my-image')
  })

  it('createPaicku().build collects logs in separate arrays', async () => {
    const paicku = createPaicku({executablePath})

    const result = await paicku.build('my-image', {
      builder: 'docker.io/paketobuildpacks/builder-ubi8-base',
      path: '/path/to/app',
    })

    expect(result.stdout.some((message) => message.includes('Building image my-image'))).to.be.true
    expect(result.stderr.some((message) => message.includes('container runtime'))).to.be.true
  })

  it('createPaicku().build collects error logs when builder lacks registry prefix', async () => {
    const paicku = createPaicku({executablePath})

    try {
      await paicku.build('my-image', {
        builder: 'paketobuildpacks/builder-ubi8-base',
        path: '/path/to/app',
      })
      expect.fail('Expected build to throw')
    } catch (error) {
      expect((error as Error).message).to.include('must be prefixed with a registry')
    }
  })
})
