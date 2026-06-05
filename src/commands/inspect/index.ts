import {Command} from '@oclif/core'

import {inspectArgs, inspectFlags} from '../../flargs/inspect.js'
import {parseFlags, runPack} from '../../utils/index.js'

export default class Inspect extends Command {
  static aliases = ['inspect', 'inspect-image']

  static override args = inspectArgs

  static override description = 'Show information about a built app image'

  static override examples = ['<%= config.bin %> <%= command.id %> buildpacksio/pack']

  static override flags = inspectFlags

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Inspect)

    const flagsArray = parseFlags(flags)

    await runPack({
      cacheDir: this.config.cacheDir,
      console: {error: this.error.bind(this), log: this.log.bind(this)},
      envs: {},
      flargs: ['inspect', args.imageName, ...flagsArray],
    })
  }
}
