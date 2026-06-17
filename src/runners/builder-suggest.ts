import {Interfaces, Parser} from '@oclif/core'
import {execa} from 'execa'

import {builderSuggestArgs, builderSuggestFlags} from '../flargs/builder-suggest.js'
import {RunnerConsole, RunnerLogs} from '../types/index.js'
import {parseFlags} from '../utils/index.js'

export type BuilderSuggestOptions = Partial<Interfaces.InferredFlags<typeof builderSuggestFlags>>

export interface BuilderSuggestResult {
  code: string
  command: string
  exitCode: number
  failed: boolean
  stderr: string[]
  stdout: string[]
}

type BuilderSuggestRunnerOptions = {
  console: RunnerConsole
  cwd?: string
  env?: Record<string, string | undefined>
  logs?: RunnerLogs
}

export async function runBuilderSuggest(
  options: BuilderSuggestOptions,
  executablePath: string,
  runnerOptions: BuilderSuggestRunnerOptions,
): Promise<BuilderSuggestResult> {
  const {console, cwd, env: runnerEnv, logs = {error: [], log: [], warn: []}} = runnerOptions
  const {env: processEnv} = process

  const argvs: string[] = []

  const flargs = parseFlags(options)

  argvs.push(...flargs)

  await Parser.parse(argvs, {args: builderSuggestArgs, flags: builderSuggestFlags})

  const packArgs = ['builder', 'suggest', ...argvs]


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
    console.error(`Build failed.`, {exit: result.exitCode ?? 1})
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
