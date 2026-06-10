import {Config} from '@oclif/core'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {downloadPack} from '../hooks/prerun/download-pack.js'
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

  const resolveExecutablePath = async (): Promise<{logs: string[]; resolvedExecutablePath: string}> => {
    if (options.executablePath) {
      return {logs: [], resolvedExecutablePath: options.executablePath}
    }

    const {cacheDir} = await Config.load(path.join(__dirname, '..'))
    const {logs} = await downloadPack(cacheDir)
    resolvedExecutablePath = path.join(cacheDir, 'pack')

    return {logs, resolvedExecutablePath}
  }

  return {
    async inspect<T = unknown>(imageName: string, inspectOptions: InspectOptions = {}): Promise<InspectResult<T>> {
      const {resolvedExecutablePath} = await resolveExecutablePath()

      return runInspect(imageName, inspectOptions, resolvedExecutablePath, {
        captureStdout: true,
        cwd: options.cwd,
        env: options.env,
      }) as Promise<InspectResult<T>>
    },
  }
}
