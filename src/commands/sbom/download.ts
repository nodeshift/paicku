import {Command} from '@oclif/core'
import path from 'node:path'

import {sbomArgs, sbomFlags} from '../../flargs/sbom-download.js'
import {runSbomDownload} from '../../runners/sbom-download.js'

export default class SbomDownload extends Command {
  static override readonly args = sbomArgs

  static override readonly description = 'Interact with SBoM'

  static override readonly examples = ['<%= config.bin %> <%= command.id %> buildpacksio/pack']

  static override readonly flags = sbomFlags

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(SbomDownload)

    await runSbomDownload(args.imageName, flags, path.join(this.config.cacheDir, 'pack'), {
      console: {
        error: this.error.bind(this),
        log: this.log.bind(this),
        logToStderr: this.logToStderr.bind(this),
        warn: this.warn.bind(this),
      },
    })
  }
}
