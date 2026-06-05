import {Command, Flags} from '@oclif/core'

import {globalFlags} from '../../flargs/global.js'
import {parseFlags, runPack} from '../../utils/index.js'

export default class BuilderSuggest extends Command {
  static aliases = ['builder:suggest', 'builders:suggest']

  static override args = {}

  static override description = 'Interact with builders'

  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    ...globalFlags,
    help: Flags.boolean({char: 'h', description: "Help for 'builder'"}),
  }

  public async run(): Promise<void> {
    const {flags} = await this.parse(BuilderSuggest)

    const flagsArray = parseFlags(flags)

    await runPack({
      cacheDir: this.config.cacheDir,
      console: {error: this.error.bind(this), log: this.log.bind(this)},
      envs: {},
      flargs: ['builder', 'suggest', ...flagsArray],
    })
  }
}
