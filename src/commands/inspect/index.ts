import {Command} from '@oclif/core'
import path from 'node:path'

import {inspectArgs, inspectFlags} from '../../flargs/inspect.js'
import {runInspect} from '../../runners/inspect.js'

export default class Inspect extends Command {
  static readonly aliases = ['inspect', 'inspect-image']

  static override readonly args = inspectArgs

  static override readonly description = 'Show information about a built app image'

  static override readonly examples = ['<%= config.bin %> <%= command.id %> buildpacksio/pack']

  static override readonly flags = inspectFlags

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Inspect)

    await runInspect(args.imageName, flags, path.join(this.config.cacheDir, 'pack'), {
      console: {
        error: this.error.bind(this),
        log: this.log.bind(this),
        logToStderr: this.logToStderr.bind(this),
        warn: this.warn.bind(this),
      },
    })
  }
}
