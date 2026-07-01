import {Config} from '@oclif/core'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {downloadPack} from '../hooks/prerun/download-pack.js'
import {type BuildResult, runBuild} from '../runners/build.js'
import {type BuilderSuggestOptions, type BuilderSuggestResult, runBuilderSuggest} from '../runners/builder-suggest.js'
import {type InspectOptions, type InspectResult, runInspect} from '../runners/inspect.js'
import {type BuiltImageRunOptions, type RunningContainer, run as runContainer} from '../runners/run.js'
import {type SbomDownloadOptions, type SbomDownloadResult, runSbomDownload} from '../runners/sbom-download.js'
import {type PaickuBuildOptions, type RunnerLogs} from '../types/index.js'
import {createRunnerConsole, throwOnConfirm} from '../types/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type PaickuOptions = {
  cwd?: string
  executablePath?: string
}

export type {PaickuBuildOptions} from '../types/index.js'

export interface BuiltImage extends BuildResult {
  run(options?: BuiltImageRunOptions): Promise<RunningContainer>
}

export type PaickuBuilderClient = {
  suggest(options?: BuilderSuggestOptions): Promise<BuilderSuggestResult>
}

export type PaickuSbomClient = {
  download(imageName: string, options?: SbomDownloadOptions): Promise<SbomDownloadResult>
}

export type PaickuClient = {
  build(options?: PaickuBuildOptions): Promise<BuiltImage>
  builder: PaickuBuilderClient
  inspect(imageName: string, options?: InspectOptions): Promise<InspectResult>
  sbom: PaickuSbomClient
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
    async build(buildOptions: PaickuBuildOptions = {}): Promise<BuiltImage> {
      const {imageName, ...flags} = buildOptions
      const {resolvedExecutablePath} = await resolveExecutablePath()
      const logs: RunnerLogs = {error: [], log: [], warn: []}
      const console = createRunnerConsole(logs)

      const rawBuildData = await runBuild(imageName, {...flags, 'no-color': true}, resolvedExecutablePath, {
        confirm: throwOnConfirm,
        console,
        cwd: options.cwd,
        logs,
      })

      return {
        ...rawBuildData,
        run: async (runOptions: BuiltImageRunOptions = {}): Promise<RunningContainer> =>
          runContainer({
            ...runOptions,
            envsForRun: rawBuildData.envsForRun,
            imageName: rawBuildData.imageName,
          }),
      }
    },
    builder: {
      async suggest(builderOptions: BuilderSuggestOptions = {}): Promise<BuilderSuggestResult> {
        const {resolvedExecutablePath} = await resolveExecutablePath()
        const logs: RunnerLogs = {error: [], log: [], warn: []}
        const console = createRunnerConsole(logs)

        return runBuilderSuggest({...builderOptions, 'no-color': true}, resolvedExecutablePath, {
          console,
          cwd: options.cwd,
          logs,
        })
      },
    },
    async inspect(imageName: string, inspectOptions: InspectOptions = {}): Promise<InspectResult> {
      const {resolvedExecutablePath} = await resolveExecutablePath()
      const logs: RunnerLogs = {error: [], log: [], warn: []}
      const console = createRunnerConsole(logs)
      return runInspect(imageName, {...inspectOptions, 'no-color': true}, resolvedExecutablePath, {
        confirm: throwOnConfirm,
        console,
        cwd: options.cwd,
        logs,
      })
    },
    sbom: {
      async download(imageName: string, sbomOptions: SbomDownloadOptions = {}): Promise<SbomDownloadResult> {
        const {resolvedExecutablePath} = await resolveExecutablePath()
        const logs: RunnerLogs = {error: [], log: [], warn: []}
        const console = createRunnerConsole(logs)
        return runSbomDownload(imageName, {...sbomOptions, 'no-color': true}, resolvedExecutablePath, {
          console,
          cwd: options.cwd,
          logs,
        })
      },
    },
  }
}
