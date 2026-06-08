import {Config, Interfaces, Parser} from '@oclif/core'
import {execa} from 'execa'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {inspectArgs, inspectFlags} from '../flargs/inspect.js'
import {parseFlags} from '../utils/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
}

function parseJsonOutput<T>(stdout: string): Pick<InspectResult<T>, 'data' | 'parseError'> {
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
  options: InspectOptions = {},
  cacheDir?: string,
  {captureStdout = false}: InspectRunnerOptions = {},
): Promise<InspectResult | string> {
  const argvs = [imageName]

  const flargs = parseFlags(options)

  argvs.push(...flargs)

  const resolvedCacheDir = cacheDir ?? (await Config.load(path.join(__dirname, '..'))).cacheDir
  const packBinFilepath = path.join(resolvedCacheDir, 'pack')

  await Parser.parse(argvs, {args: inspectArgs, flags: inspectFlags})

  const packArgs = ['inspect', ...argvs]
  const command = [packBinFilepath, ...packArgs].join(' ')

  if (captureStdout) {
    const {exitCode, stderr, stdout} = await execa(packBinFilepath, packArgs, {
      reject: false,
      stdio: ['inherit', 'pipe', 'pipe'],
    })

    const stdoutStr = stdout ?? ''
    const stderrStr = stderr ?? ''
    const {data, parseError} =
      options.output === 'json' ? parseJsonOutput(stdoutStr) : {data: null}

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

  await execa(packBinFilepath, packArgs, {
    reject: false,
    stdio: 'inherit',
  })

  return ''
}

export async function inspect<T = unknown>(
  imageName: string,
  options: InspectOptions = {},
  cacheDir?: string,
): Promise<InspectResult<T>> {
  return runInspect(imageName, options, cacheDir, {captureStdout: true}) as Promise<InspectResult<T>>
}
