import {Config, Interfaces, Parser} from '@oclif/core'
import {execa} from 'execa'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

import {inspectArgs, inspectFlags} from '../flargs/inspect.js'
import {parseFlags} from '../utils/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type InspectOptions = Partial<Interfaces.InferredFlags<typeof inspectFlags>>

type InspectRunnerOptions = {
  captureStdout?: boolean
}

export async function runInspect(
  imageName: string,
  options: InspectOptions = {},
  cacheDir?: string,
  {captureStdout = false}: InspectRunnerOptions = {},
): Promise<string> {
  const argvs = [imageName]

  const flargs = parseFlags(options)

  argvs.push(...flargs)

  const resolvedCacheDir = cacheDir ?? (await Config.load(path.join(__dirname, '..'))).cacheDir
  const packBinFilepath = path.join(resolvedCacheDir, 'pack')

  await Parser.parse(argvs, {args: inspectArgs, flags: inspectFlags})

  const packArgs = ['inspect', ...argvs]

  const {exitCode, stderr, stdout} = await execa(packBinFilepath, packArgs, {
    reject: false,
    stdio: captureStdout ? ['inherit', 'pipe', 'pipe'] : 'inherit',
  })

  if (!captureStdout) {
    return ''
  }

  if (exitCode === 0) {
    return stdout ?? ''
  }

  return stderr ?? ''
}

export async function inspect(imageName: string, options: InspectOptions = {}, cacheDir?: string): Promise<string> {
  return runInspect(imageName, options, cacheDir, {captureStdout: true})
}
