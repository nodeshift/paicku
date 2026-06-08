import {Command} from '@oclif/core'

import {inspectArgs, inspectFlags} from '../../flargs/inspect.js'
import {runInspect} from '../../runners/inspect.js'
import {parseFlags} from '../../utils/index.js'

export default class Inspect extends Command {
  static readonly aliases = ['inspect', 'inspect-image']

  static override readonly args = inspectArgs

  static override readonly description = 'Show information about a built app image'

  static override readonly examples = ['<%= config.bin %> <%= command.id %> buildpacksio/pack']

  static override readonly flags = inspectFlags

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Inspect)

    const flagsArray = parseFlags(flags)

    this.debug(`inspect ${args.imageName} ${flagsArray.join(' ')}`)

    await runInspect(args.imageName, flags, this.config.cacheDir)
  }
}
