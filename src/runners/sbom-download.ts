import {Interfaces, Parser} from '@oclif/core'
import {execa} from 'execa'

import {sbomArgs, sbomFlags} from '../flargs/sbom-download.js'
import {parseFlags} from '../utils/index.js'

export type SbomDownloadOptions = Partial<Interfaces.InferredFlags<typeof sbomFlags>>

export interface SbomDownloadResult {
  code: string
  command: string
  exitCode: number
  failed: boolean
  stderr: string
  stdout: string
}

type SbomDownloadRunnerOptions = {
  captureStdout?: boolean
  cwd?: string
  env?: Record<string, string>
}


export async function runSbomDownload(
  imageName: string,
  executablePath: string,
  options: SbomDownloadOptions = {},
  runnerOptions: SbomDownloadRunnerOptions = {},
): Promise<SbomDownloadResult> {
  const {captureStdout = false, cwd, env} = runnerOptions
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
    code: "",
    command: "",
    exitCode: 0,
    failed: false,
    stderr: '',
    stdout: '',
  }
}
