import {Command} from '@oclif/core'
import path from 'node:path'

import {builderSuggestArgs, builderSuggestFlags} from '../../flargs/builder-suggest.js'
import {runBuilderSuggest} from '../../runners/builder-suggest.js'

export default class BuilderSuggest extends Command {
  static readonly aliases = ['builder:suggest', 'builders:suggest']

  static override readonly args = builderSuggestArgs

  static override readonly description = 'Display suggested builders for the given application'

  static override readonly examples = ['<%= config.bin %> <%= command.id %>']

  static override readonly flags = builderSuggestFlags

  public async run(): Promise<void> {
    const {flags} = await this.parse(BuilderSuggest)

    await runBuilderSuggest(flags, path.join(this.config.cacheDir, 'pack'))
  }
}
