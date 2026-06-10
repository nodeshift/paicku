import {Flags} from '@oclif/core'

import {globalFlags} from './global.js'

export const builderSuggestArgs = {}

export const builderSuggestFlags = {
  ...globalFlags,
  help: Flags.boolean({char: 'h', description: "Help for 'builder suggest'"}),
}
