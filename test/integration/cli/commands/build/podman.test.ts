import {runCommand} from '@oclif/test'
import {config, expect} from 'chai'
import {execa} from 'execa'
import {it} from 'mocha'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

config.truncateThreshold = 0

const TEST_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../..')

describe('build (podman)', () => {
  it('It should build a Nodejs app', async () => {
    const imageName = `${crypto.randomUUID()}`

    const testdataPath = path.join(TEST_DIR, 'testdata/nodejs_simple_app')
    const flargs = [
      'build',
      imageName,
      '--builder',
      'docker.io/paketobuildpacks/builder-jammy-base',
      '--path',
      testdataPath,
      '--container-runtime',
      'podman',
      '--no-color',
    ].join(' ')

    const {error, stdout} = await runCommand(flargs)
    expect(error).to.be.undefined
    expect(stdout).to.contain(`Successfully built image '${imageName}'`)

    const inspect = await execa('podman', ['image', 'inspect', imageName], {reject: false})
    expect(inspect.exitCode).to.equal(0)

    const {error: inspectError, stdout: inspectStdout} = await runCommand(`inspect ${imageName} --no-color`)
    expect(inspectError).to.be.undefined
    expect(inspectStdout).to.contain(imageName)
  })
})
