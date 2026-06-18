import {config, expect} from 'chai'
import {it} from 'mocha'

import {createPaicku} from '../../../../../src/index.js'

config.truncateThreshold = 0

describe('programmatic API builder suggest (docker)', () => {
  it('should suggest builders', async () => {
    const paicku = createPaicku()

    const result = await paicku.builder.suggest()

    expect(result.failed).to.be.false
    expect(result.stdout.join('\n')).to.contain('Suggested builders:')
  })
})
