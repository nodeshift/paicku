import {Args, Flags} from '@oclif/core'

import {globalFlags} from './global.js'

export const inspectArgs = {
  imageName: Args.string({description: 'Name of the image to inspect', required: true}),
}

export const inspectFlags = {
  ...globalFlags,
  bom: Flags.boolean({description: 'print bill of materials'}),
  help: Flags.boolean({char: 'h', description: "Help for 'inspect'"}),
  output: Flags.string({
    char: 'o',
    default: 'human-readable',
    description: 'Output format to display builder detail.',
    options: ['json', 'yaml', 'toml', 'human-readable'],
  }),
}
