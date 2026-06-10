import {Interfaces, Parser} from '@oclif/core'
import {execa} from 'execa'

import {sbomArgs, sbomFlags} from '../flargs/sbom-download.js'
import {parseFlags} from '../utils/index.js'

export type SbomDownloadOptions = Partial<Interfaces.InferredFlags<typeof sbomFlags>>

export interface SbomDownloadResult<T = unknown> {
  code: string
  command: string
  exitCode: number
  failed: boolean
  parseError?: Error
  parsedStdout: T | null
  stderr: string
  stdout: string
}

type SbomDownloadRunnerOptions = {
  captureStdout?: boolean
  cwd?: string
  env?: Record<string, string>
}

function parseCommandJsonOutput<T>(stdout: string): {data: T | null; parseError: Error | undefined} {
  try {
    return {data: JSON.parse(stdout), parseError: undefined}
  } catch (error) {
    return {
      data: null,
      parseError: error instanceof Error ? error : new Error(String(error)),
    }
  }
}

export async function runSbomDownload(
  imageName: string,
  executablePath: string,
  options: SbomDownloadOptions = {},
  {captureStdout = false, cwd, env}: SbomDownloadRunnerOptions = {},
): Promise<SbomDownloadResult | string> {
  const argvs = [imageName]

  const flargs = parseFlags(options)

  argvs.push(...flargs)

  await Parser.parse(argvs, {args: sbomArgs, flags: sbomFlags})

  const packArgs = ['sbom', 'download', ...argvs]

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

    const {data, parseError} =
      options['output-dir'] === 'json'
        ? parseCommandJsonOutput(result.stdout ?? '')
        : {data: null, parseError: undefined}

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

  return ''
}
