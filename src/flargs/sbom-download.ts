import {Args, Flags} from '@oclif/core'

import {globalFlags} from './global.js'

export const sbomArgs = {
  imageName: Args.string({description: 'Download SBoM from specified image', required: true}),
}

export const sbomFlags = {
  ...globalFlags,
  help: Flags.boolean({char: 'h', description: "Help for 'download'"}),
  'output-dir': Flags.string({char: 'o', default: '.', description: 'Path to export SBoM contents.'}),
  remote: Flags.string({description: 'Download SBoM of image in remote registry (without pulling image)'}),
}
