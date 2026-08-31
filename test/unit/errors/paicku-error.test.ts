import {expect} from 'chai'

import {PaickuError} from '../../../src/errors/paicku-error.js'
import {createRunnerConsole, throwOnConfirm} from '../../../src/types/index.js'

describe('PaickuError', () => {
  it('formats pack failures with exit code and warnings', () => {
    const error = new PaickuError('Build failed.', {
      command: 'pack build my-image --no-color',
      exitCode: 7,
      stdout: ['Building image my-image'],
      warnings: ['You have not specified a container runtime', 'ERROR: failed to build'],
    })

    expect(error).to.be.instanceOf(Error)
    expect(error.name).to.equal('PaickuError')
    expect(error.exitCode).to.equal(7)
    expect(error.command).to.equal('pack build my-image --no-color')
    expect(error.stdout).to.deep.equal(['Building image my-image'])
    expect(error.warnings).to.deep.equal(['You have not specified a container runtime', 'ERROR: failed to build'])
    expect(error.message).to.equal(
      'Build failed. (exit code 7)\n\nYou have not specified a container runtime\nERROR: failed to build',
    )
    expect(error.message).to.not.include('pack build my-image')
  })

  it('keeps validation messages short and defaults exitCode to 1', () => {
    const error = new PaickuError('The builder must be prefixed with a registry.')

    expect(error.exitCode).to.equal(1)
    expect(error.command).to.be.undefined
    expect(error.stdout).to.deep.equal([])
    expect(error.warnings).to.deep.equal([])
    expect(error.message).to.equal('The builder must be prefixed with a registry.')
  })
})

describe('createRunnerConsole', () => {
  it('throws PaickuError with snapshotted logs and exit options', () => {
    const logs = {log: ['stdout line'], warn: ['warn line']}
    const runnerConsole = createRunnerConsole(logs)

    try {
      runnerConsole.error('Build failed.', {command: 'pack build my-image', exit: 7})
      expect.fail('Expected createRunnerConsole.error to throw')
    } catch (error) {
      expect(error).to.be.instanceOf(PaickuError)
      const paickuError = error as PaickuError
      expect(paickuError.exitCode).to.equal(7)
      expect(paickuError.command).to.equal('pack build my-image')
      expect(paickuError.stdout).to.deep.equal(['stdout line'])
      expect(paickuError.warnings).to.deep.equal(['warn line'])
      expect(paickuError.message).to.include('Build failed. (exit code 7)')
      expect(paickuError.message).to.not.include('pack build my-image')
      expect(paickuError.message).to.include('warn line')
    }
  })
})

describe('throwOnConfirm', () => {
  it('throws PaickuError with the confirmation message', async () => {
    try {
      await throwOnConfirm({message: 'Add host to known_hosts?'})
      expect.fail('Expected throwOnConfirm to throw')
    } catch (error) {
      expect(error).to.be.instanceOf(PaickuError)
      const paickuError = error as PaickuError
      expect(paickuError.exitCode).to.equal(1)
      expect(paickuError.message).to.include('Add host to known_hosts?')
      expect(paickuError.message).to.include('non-interactive mode')
    }
  })
})
