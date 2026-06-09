import {Interfaces, Parser} from '@oclif/core'
import {execa} from 'execa'

import {inspectArgs, inspectFlags} from '../flargs/inspect.js'
import {parseFlags} from '../utils/index.js'

export type InspectOptions = Partial<Interfaces.InferredFlags<typeof inspectFlags>>

export interface InspectResult<T = unknown> {
  command: string
  data: T | null
  exitCode: number
  parseError?: Error
  stderr: string
  stdout: string
  success: boolean
}

type InspectRunnerOptions = {
  captureStdout?: boolean
  cwd?: string
  env?: Record<string, string>
}

function parseCommandJsonOutput<T>(stdout: string): Pick<InspectResult<T>, 'data' | 'parseError'> {
  try {
    return {data: JSON.parse(stdout) as T}
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
  {captureStdout = false, cwd, env}: InspectRunnerOptions = {},
): Promise<InspectResult | string> {
  const argvs = [imageName]

  const flargs = parseFlags(options)

  argvs.push(...flargs)

  await Parser.parse(argvs, {args: inspectArgs, flags: inspectFlags})

  const packArgs = ['inspect', ...argvs]
  const command = [executablePath, ...packArgs].join(' ')
  const execOptions = {
    cwd,
    ...(env ? {env: {...process.env, ...env}} : {}),
  }

  if (captureStdout) {
    const {exitCode, stderr, stdout} = await execa(executablePath, packArgs, {
      ...execOptions,
      reject: false,
      stdio: ['inherit', 'pipe', 'pipe'],
    })

    const stdoutStr = stdout ?? ''
    const stderrStr = stderr ?? ''
    const {data, parseError} =
      options.output === 'json' ? parseCommandJsonOutput(stdoutStr) : {data: null}

    return {
      command,
      data,
      exitCode: exitCode ?? 1,
      parseError,
      stderr: stderrStr,
      stdout: stdoutStr,
      success: exitCode === 0,
    }
  }

  await execa(executablePath, packArgs, {
    ...execOptions,
    stdio: 'inherit',
  })

  return ''
}

