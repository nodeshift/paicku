import {Command} from '@oclif/core'
import os from 'node:os'
import path from 'node:path'

import {CONTAINER_RUNTIMES_IN_PRIORITY, DEFAULT_BUILDER_IMAGE} from '../../constants/index.js'
import {buildArgs, buildFlags} from '../../flargs/build.js'
import {
  cloneRepo,
  configureContainerRuntime,
  filterByInstalledApps,
  hasRegistryPrefix,
  parseFlags,
  parseGitRemoteRepo,
  runPack,
  sortArrayBasedOnOrder,
} from '../../utils/index.js'

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
    let envs = {}

    const arch = os.arch()
    const {platform} = process

    if (flags['container-runtime']) {
      const availableContainerRuntimes = await filterByInstalledApps([flags['container-runtime']], platform)

      if (availableContainerRuntimes.length === 0) {
        this.error(`${flags['container-runtime']} is not installed.`)
      }
    } else {
      const availableContainerRuntimes = await filterByInstalledApps(CONTAINER_RUNTIMES_IN_PRIORITY, platform)

      if (availableContainerRuntimes.length === 0) {
        this.error('No available container runtime available in the system.')
      }

      // Sort the array based on the priority order
      const containerRuntimesInPriorityOrder = sortArrayBasedOnOrder(
        availableContainerRuntimes,
        CONTAINER_RUNTIMES_IN_PRIORITY,
      )

      flags['container-runtime'] = containerRuntimesInPriorityOrder[0]
      this.warn(`You haven't specified a container runtime, using the: ${flags['container-runtime']}`)
    }

    const containerRuntime = flags['container-runtime']

    // We delete the flag because this flag does not exit
    // on pack cli but only on paicku.
    delete flags['container-runtime']

    // Validate container runtime is up and running
    const packConfiguration = await configureContainerRuntime(
      containerRuntime,
      {
        arch,
        platform,
      },
      {
        error: this.error.bind(this),
        log: this.log.bind(this),
      },
    )
    envs = packConfiguration.envs

    if (!args.imageName) {
      args.imageName = `image-paicku-${crypto.randomUUID()}`
      this.warn(`You havent specified an image name, using a random one: ${args.imageName}`)
    }

    if (!flags.builder) {
      flags.builder = DEFAULT_BUILDER_IMAGE
      this.warn(`You haven't specified a builder, using the default one: ${flags.builder}`)
    }

    if (!hasRegistryPrefix(flags.builder)) {
      this.error(`The builder "${flags.builder}" must be prefixed with a registry (e.g. "docker.io/" or "ghcr.io/").`)
    }

    const {context, gitURL, isGitRemoteRepo} = await parseGitRemoteRepo(flags.path)
    if (isGitRemoteRepo) {
      const clonedAppDir = await cloneRepo(gitURL, this.config.cacheDir, this.log.bind(this), this.error.bind(this))
      flags.path = path.join(clonedAppDir, context)
    }

    const flagsArray = parseFlags(flags)

    this.log(`Building image ${args.imageName} with builder ${flags.builder}`)

    await runPack({
      cacheDir: this.config.cacheDir,
      console: {error: this.error.bind(this), log: this.log.bind(this)},
      envs,
      flargs: ['build', args.imageName, ...flagsArray, ...packConfiguration.flags],
    })
  }
}
