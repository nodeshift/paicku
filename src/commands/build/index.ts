import {Command} from '@oclif/core'
import path from 'node:path'

import {buildArgs, buildFlags} from '../../flargs/build.js'
import {runBuild} from '../../runners/build.js'

export default class Build extends Command {
  static override readonly args = buildArgs

  static override readonly description = 'Build an image'

  static override readonly enableJsonFlag = true

  static override readonly examples = [
    {
      command: `<%= config.bin %> <%= command.id %>`,
      description: 'Build an app with a random image-name and default builder',
    },
    {
      command: `<%= config.bin %> <%= command.id %> image-name --builder docker.io/paketobuildpacks/builder-ubi8-base`,
      description: 'Build and app with a specific image-name and builder',
    },
    {
      command: `<%= config.bin %> <%= command.id %> backend-image-name  --path https://github.com/nodeshift/mern-workshop --context-dir backend`,
      description: 'Build an app from a remote git repository with specifying a sub-directory.',
    },
    {
      command: `<%= config.bin %> <%= command.id %> image-name --builder docker.io/paketobuildpacks/builder-ubi8-base --path /path/to/app`,
      description: 'Build an app with a specific image-name and builder with a specific local path',
    },
  ]

  static override readonly flags = buildFlags

  async run(): Promise<void> {
    const {args, flags} = await this.parse(Build)

    await runBuild(args.imageName, flags, path.join(this.config.cacheDir, 'pack'), {
      console: {
        error: this.error.bind(this),
        log: this.log.bind(this),
        logToStderr: this.logToStderr.bind(this),
        warn: this.warn.bind(this),
      },
    })
  }
}
