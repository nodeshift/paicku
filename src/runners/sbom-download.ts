import {Interfaces, Parser} from '@oclif/core'
import {execa} from 'execa'

import {sbomArgs, sbomFlags} from '../flargs/sbom-download.js'
import {RunnerConsole, RunnerLogs} from '../types/index.js'
import {parseFlags} from '../utils/index.js'

export type SbomDownloadOptions = Partial<Interfaces.InferredFlags<typeof sbomFlags>>

export interface SbomDownloadResult {
  code: string
  command: string
  exitCode: number
  failed: boolean
  stderr: string[]
  stdout: string[]
}

type SbomDownloadRunnerOptions = {
  console: RunnerConsole
  cwd?: string
  env?: Record<string, string | undefined>
  logs?: RunnerLogs
}

export async function runSbomDownload(
  imageName: string,
  options: SbomDownloadOptions,
  executablePath: string,
  runnerOptions: SbomDownloadRunnerOptions,
): Promise<SbomDownloadResult> {
  const {console, cwd, env: runnerEnv, logs = {error: [], log: [], warn: []}} = runnerOptions
  const {env: processEnv} = process

  const argvs = [imageName]

  const flargs = parseFlags(options)

  argvs.push(...flargs)

  await Parser.parse(argvs, {args: sbomArgs, flags: sbomFlags})

  const packArgs = ['sbom', 'download', ...argvs]

  const execOptions = {
    cwd,
    env: {
      ...processEnv,
      ...runnerEnv,
    },
  }

  const execaOptions = {
    ...execOptions,
    reject: false,
    stdio: ['inherit', 'pipe', 'pipe'] as const,
  }

  const subprocess = execa(executablePath, packArgs, execaOptions)

  if (subprocess.stdout) {
    subprocess.stdout.on('data', (chunk) => {
      console.log(chunk.toString().trimEnd())
    })
  }

  if (subprocess.stderr) {
    subprocess.stderr.on('data', (chunk) => {
      console.logToStderr(chunk.toString().trimEnd())
    })
  }

  const result = await subprocess

  if (result.failed) {
    console.error(`sbom download failed.`, {exit: result.exitCode ?? 1})
  }

  return {
    code: result.code ?? '',
    command: result.command,
    exitCode: result.exitCode ?? 1,
    failed: result.failed,
    stderr: [...logs.warn, ...logs.error],
    stdout: logs.log,
  }
}
