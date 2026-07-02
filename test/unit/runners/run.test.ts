import {expect} from 'chai'

import {run} from '../../../src/runners/run.js'

describe('run exposedPorts', () => {
  it('rejects invalid exposed port values', async () => {
    try {
      await run({exposedPorts: 'abc', imageName: 'ignored'})
      expect.fail('Expected run to throw')
    } catch (error) {
      expect((error as Error).message).to.equal('Invalid exposed port: abc')
    }
  })

  it('rejects empty exposedPorts arrays', async () => {
    try {
      await run({exposedPorts: [], imageName: 'ignored'})
      expect.fail('Expected run to throw')
    } catch (error) {
      expect((error as Error).message).to.equal('exposedPorts must include at least one port')
    }
  })
})
