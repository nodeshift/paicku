import {Args, Command, Flags} from '@oclif/core'

import {globalFlags} from '../../flargs/global.js'
import {parseFlags, runPack} from '../../utils/index.js'

export default class SbomDownload extends Command {
  static override args = {
    imageName: Args.string({description: 'Download SBoM from specified image', required: true}),
  }

  static override description = 'Interact with SBoM'

  static override examples = ['<%= config.bin %> <%= command.id %> buildpacksio/pack']

  static override flags = {
    ...globalFlags,
    help: Flags.boolean({char: 'h', description: "Help for 'download'"}),
    'output-dir': Flags.string({char: 'o', default: '.', description: 'Path to export SBoM contents.'}),
    remote: Flags.string({description: 'Download SBoM of image in remote registry (without pulling image)'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(SbomDownload)

    const flagsArray = parseFlags(flags)

    await runPack({
      cacheDir: this.config.cacheDir,
      console: {error: this.error.bind(this), log: this.log.bind(this)},
      envs: {},
      flargs: ['sbom', 'download', args.imageName, ...flagsArray],
    })
  }
}
