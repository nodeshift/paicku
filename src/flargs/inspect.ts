import {Args, Flags} from '@oclif/core'

import {CONTAINER_RUNTIMES_IN_PRIORITY} from '../constants/index.js'
import {globalFlags} from './global.js'

export const inspectArgs = {
  imageName: Args.string({description: 'Name of the image to inspect', required: true}),
}

export const inspectFlags = {
  ...globalFlags,
  bom: Flags.boolean({description: 'print bill of materials'}),
  'container-runtime': Flags.string({
    description: 'Specify container runtime to inspect your image.',
    options: CONTAINER_RUNTIMES_IN_PRIORITY,
  }),
  help: Flags.boolean({char: 'h', description: "Help for 'inspect'"}),
  output: Flags.option({
    char: 'o',
    default: 'human-readable',
    description: 'Output format to display builder detail.',
    options: ['json', 'yaml', 'toml', 'human-readable'] as const,
  })(),
}
