import {Interfaces, Parser} from '@oclif/core'
import {execa} from 'execa'

import {builderSuggestArgs, builderSuggestFlags} from '../flargs/builder-suggest.js'
import {parseFlags} from '../utils/index.js'

export type BuilderSuggestOptions = Partial<Interfaces.InferredFlags<typeof builderSuggestFlags>>

export interface BuilderSuggestResult {
  code: string
  command: string
  exitCode: number
  failed: boolean
  stderr: string
  stdout: string
}

type BuilderSuggestRunnerOptions = {
  captureStdout?: boolean
  cwd?: string
  env?: Record<string, string>
}

export async function runBuilderSuggest(
  options: BuilderSuggestOptions,
  executablePath: string,
  {captureStdout = false, cwd, env}: BuilderSuggestRunnerOptions = {},
): Promise<BuilderSuggestResult> {
  const argvs: string[] = []

  const flargs = parseFlags(options)

  argvs.push(...flargs)

  await Parser.parse(argvs, {args: builderSuggestArgs, flags: builderSuggestFlags})

  const packArgs = ['builder', 'suggest', ...argvs]

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


    return {
      code: result.code ?? '',
      command: result.command,
      exitCode: result.exitCode ?? 1,
      failed: result.failed,
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
    stderr: '',
    stdout: '',
  }
}
