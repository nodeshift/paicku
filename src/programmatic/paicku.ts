import {Config} from '@oclif/core'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {type InspectOptions, type InspectResult, runInspect} from '../runners/inspect.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type PaickuOptions = {
  cwd?: string
  env?: Record<string, string>
  executablePath?: string
}

export type PaickuClient = {
  inspect<T = unknown>(imageName: string, options?: InspectOptions): Promise<InspectResult<T>>
}

export function createPaicku(options: PaickuOptions = {}): PaickuClient {
  let resolvedExecutablePath: string | undefined

  const resolveExecutablePath = async (): Promise<string> => {
    if (options.executablePath) {
      return options.executablePath
    }

    if (!resolvedExecutablePath) {
      const {cacheDir} = await Config.load(path.join(__dirname, '..'))
      resolvedExecutablePath = path.join(cacheDir, 'pack')
    }

    return resolvedExecutablePath
  }

  return {
    async inspect<T = unknown>(imageName: string, inspectOptions: InspectOptions = {}): Promise<InspectResult<T>> {
      const executablePath = await resolveExecutablePath()

      return runInspect(imageName, inspectOptions, executablePath, {
        captureStdout: true,
        cwd: options.cwd,
        env: options.env,
      }) as Promise<InspectResult<T>>
    },
  }
}
