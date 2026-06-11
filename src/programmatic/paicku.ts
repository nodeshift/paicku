import {Config} from '@oclif/core'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {downloadPack} from '../hooks/prerun/download-pack.js'
import {type BuilderSuggestOptions, type BuilderSuggestResult, runBuilderSuggest} from '../runners/builder-suggest.js'
import {type InspectOptions, type InspectResult, runInspect} from '../runners/inspect.js'
import {type SbomDownloadOptions, type SbomDownloadResult, runSbomDownload} from '../runners/sbom-download.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type PaickuOptions = {
  cwd?: string
  env?: Record<string, string>
  executablePath?: string
}

export type PaickuClient = {
  builder(command: 'suggest', options?: BuilderSuggestOptions): Promise<BuilderSuggestResult>
  inspect(imageName: string, options?: InspectOptions): Promise<InspectResult>
  sbom(command: 'download', imageName: string, options?: SbomDownloadOptions): Promise<SbomDownloadResult>
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
    async builder(command: 'suggest', builderOptions: BuilderSuggestOptions = {}): Promise<BuilderSuggestResult> {
      const {resolvedExecutablePath} = await resolveExecutablePath()

      if (command !== 'suggest') {
        throw new Error(`Unsupported builder command: ${command}`)
      }

      return runBuilderSuggest(builderOptions, resolvedExecutablePath, {
        captureStdout: true,
        cwd: options.cwd,
        env: options.env,
      })
    },
    async inspect(imageName: string, inspectOptions: InspectOptions = {}): Promise<InspectResult> {
      const {resolvedExecutablePath} = await resolveExecutablePath()

      return runInspect(imageName, inspectOptions, resolvedExecutablePath, {
        captureStdout: true,
        cwd: options.cwd,
        env: options.env,
      })
    },
    async sbom(
      command: 'download',
      imageName: string,
      sbomOptions: SbomDownloadOptions = {},
    ): Promise<SbomDownloadResult> {
      const {resolvedExecutablePath} = await resolveExecutablePath()

      if (command !== 'download') {
        throw new Error(`Unsupported sbom command: ${command}`)
      }

      return runSbomDownload(imageName, resolvedExecutablePath, sbomOptions, {
        captureStdout: true,
        cwd: options.cwd,
        env: options.env,
      })
    },
  }
}
