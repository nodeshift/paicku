import {runCommand} from '@oclif/test'
import {config, expect} from 'chai'
import {it} from 'mocha'

config.truncateThreshold = 0

describe('builder suggest (docker)', () => {
  it('It should suggest builders', async () => {
    const flargs = ['builder', 'suggest', '--no-color'].join(' ')

    const {error, stdout} = await runCommand(flargs)
    expect(error).to.be.undefined
    expect(stdout).to.contain('Suggested builders:')
  })
})
