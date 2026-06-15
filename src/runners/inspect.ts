import {Interfaces, Parser} from '@oclif/core'
import {execa} from 'execa'

import {inspectArgs, inspectFlags} from '../flargs/inspect.js'
import {parseFlags} from '../utils/index.js'

export type InspectOptions = Partial<Interfaces.InferredFlags<typeof inspectFlags>>

export interface InspectResult {
  code: string
  command: string
  exitCode: number
  failed: boolean
  parseError?: Error
  parsedStdout: unknown
  stderr: string
  stdout: string
}

type InspectRunnerOptions = {
  captureStdout?: boolean
  cwd?: string
  env?: Record<string, string | undefined>
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
  runnerOptions: InspectRunnerOptions = {},
): Promise<InspectResult> {
  const {captureStdout = false, cwd, env} = runnerOptions
  const argvs = [imageName]

  const flargs = parseFlags(options)

  argvs.push(...flargs)

  await Parser.parse(argvs, {args: inspectArgs, flags: inspectFlags})

  const packArgs = ['inspect', ...argvs]

  // CWD can be undefined, as execa treats it as the current working directory
  const execOptions = {
    cwd,
    ...(env ? {env: {...process.env, ...env}} : {}),
  }

  if (captureStdout) {
    const result = await execa(executablePath, packArgs, {
      ...execOptions,
      reject: false,
      stdio: ['inherit', 'pipe', 'pipe'],
    })

    const {data, parseError} = options.output === 'json' ? parseCommandJsonOutput(result.stdout ?? '') : {data: null}

    return {
      code: result.code ?? '',
      command: result.command,
      exitCode: result.exitCode ?? 1,
      failed: result.failed,
      parseError,
      parsedStdout: data,
      stderr: result.stderr || result.shortMessage || '',
      stdout: result.stdout ?? '',
    }
  }

  await execa(executablePath, packArgs, {
    ...execOptions,
    stdio: 'inherit',
  })

  return {
    code: '',
    command: '',
    exitCode: 0,
    failed: false,
    parsedStdout: null,
    stderr: '',
    stdout: '',
  }
}
