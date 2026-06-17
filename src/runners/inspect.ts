import {Interfaces, Parser} from '@oclif/core'
import {execa} from 'execa'

import {inspectArgs, inspectFlags} from '../flargs/inspect.js'
import {RunnerConsole, RunnerLogs} from '../types/index.js'
import {parseFlags} from '../utils/index.js'

export type InspectOptions = Partial<Interfaces.InferredFlags<typeof inspectFlags>>

export interface InspectResult {
  code: string
  command: string
  exitCode: number
  failed: boolean
  parseError?: Error
  parsedStdout: unknown
  stderr: string[]
  stdout: string[]
}

type InspectRunnerOptions = {
  console: RunnerConsole
  cwd?: string
  env?: Record<string, string | undefined>
  logs?: RunnerLogs
}

function parseCommandJsonOutput(stdout: string): {data: unknown; parseError: Error | undefined} {
  try {
    return {data: JSON.parse(stdout), parseError: undefined}
  } catch (error) {
    return {
      data: null,
      parseError: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

export async function runInspect(
  imageName: string,
  options: InspectOptions,
  executablePath: string,
  runnerOptions: InspectRunnerOptions,
): Promise<InspectResult> {
  const {console, cwd, env: runnerEnv, logs = {error: [], log: [], warn: []}} = runnerOptions

  const argvs = [imageName]

  const flargs = parseFlags(options)

  argvs.push(...flargs)

  await Parser.parse(argvs, {args: inspectArgs, flags: inspectFlags})

  const packArgs = ['inspect', ...argvs]

  const {env: processEnv} = process

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
    console.error(`inspect failed.`, {exit: result.exitCode ?? 1})
  }

  const {data, parseError} = options.output === 'json' ? parseCommandJsonOutput(result.stdout ?? '') : {data: null}

  return {
    code: result.code ?? '',
    command: result.command,
    exitCode: result.exitCode ?? 1,
    failed: result.failed,
    parseError,
    parsedStdout: data,
    stderr: [...logs.warn, ...logs.error],
    stdout: logs.log,
  }
}
