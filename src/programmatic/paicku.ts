import {Config} from '@oclif/core'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {downloadPack} from '../hooks/prerun/download-pack.js'
import {type BuildResult, runBuild} from '../runners/build.js'
import {type BuilderSuggestOptions, type BuilderSuggestResult, runBuilderSuggest} from '../runners/builder-suggest.js'
import {type InspectOptions, type InspectResult, runInspect} from '../runners/inspect.js'
import {type SbomDownloadOptions, type SbomDownloadResult, runSbomDownload} from '../runners/sbom-download.js'
import {type StartOptions, type StartResult, runStart} from '../runners/start.js'
import {type PaickuBuildOptions, type RunnerLogs} from '../types/index.js'
import {createRunnerConsole} from '../types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type PaickuOptions = {
  cwd?: string
  env?: Record<string, string | undefined>
  executablePath?: string
}

export type {PaickuBuildOptions} from '../types/index.js'

export type PaickuBuilderClient = {
  suggest(options?: BuilderSuggestOptions): Promise<BuilderSuggestResult>
}

export type PaickuSbomClient = {
  download(imageName: string, options?: SbomDownloadOptions): Promise<SbomDownloadResult>
}

export type PaickuClient = {
  build(options?: PaickuBuildOptions): Promise<BuildResult>
  builder: PaickuBuilderClient
  inspect(imageName: string, options?: InspectOptions): Promise<InspectResult>
  sbom: PaickuSbomClient
  start(options: StartOptions): Promise<StartResult>
}

export function createPaicku(options: PaickuOptions = {}): PaickuClient {
  let resolvePromise: Promise<{logs: string[]; resolvedExecutablePath: string}> | undefined

  const resolveExecutablePath = (): Promise<{logs: string[]; resolvedExecutablePath: string}> => {
    resolvePromise ??= (async () => {
      if (options.executablePath) {
        return {logs: [], resolvedExecutablePath: options.executablePath}
      }

      const {cacheDir} = await Config.load(path.join(__dirname, '..'))
      const {logs} = await downloadPack(cacheDir)

      return {logs, resolvedExecutablePath: path.join(cacheDir, 'pack')}
    })()

    return resolvePromise
  }

  return {
    async build(buildOptions: PaickuBuildOptions = {}): Promise<BuildResult> {
      const {imageName, ...flags} = buildOptions
      const {resolvedExecutablePath} = await resolveExecutablePath()
      const logs: RunnerLogs = {error: [], log: [], warn: []}
      const console = createRunnerConsole(logs)

      return runBuild(imageName, {...flags, 'no-color': true}, resolvedExecutablePath, {
        console,
        cwd: options.cwd,
        env: options.env,
        logs,
      })
    },
    builder: {
      async suggest(builderOptions: BuilderSuggestOptions = {}): Promise<BuilderSuggestResult> {
        const {resolvedExecutablePath} = await resolveExecutablePath()
        const logs: RunnerLogs = {error: [], log: [], warn: []}
        const console = createRunnerConsole(logs)

        return runBuilderSuggest({...builderOptions, 'no-color': true}, resolvedExecutablePath, {
          console,
          cwd: options.cwd,
          env: options.env,
          logs,
        })
      },
    },
    async inspect(imageName: string, inspectOptions: InspectOptions = {}): Promise<InspectResult> {
      const {resolvedExecutablePath} = await resolveExecutablePath()
      const logs: RunnerLogs = {error: [], log: [], warn: []}
      const console = createRunnerConsole(logs)
      return runInspect(imageName, {...inspectOptions, 'no-color': true}, resolvedExecutablePath, {
        console,
        cwd: options.cwd,
        env: options.env,
        logs,
      })
    },
    sbom: {
      async download(imageName: string, sbomOptions: SbomDownloadOptions = {}): Promise<SbomDownloadResult> {
        const {resolvedExecutablePath} = await resolveExecutablePath()
        const logs: RunnerLogs = {error: [], log: [], warn: []}
        const console = createRunnerConsole(logs)
        return runSbomDownload(
          imageName,
          resolvedExecutablePath,
          {console, cwd: options.cwd, env: options.env, logs},
          {...sbomOptions, 'no-color': true},
        )
      },
    },
    async start(startOptions: StartOptions): Promise<StartResult> {
      return runStart(startOptions, {
        env: options.env,
      })
    },
  }
}
