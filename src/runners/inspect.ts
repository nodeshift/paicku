import {Interfaces, Parser} from '@oclif/core'
import {execa} from 'execa'
import os from 'node:os'
import process from 'node:process'

import {CONTAINER_RUNTIMES_IN_PRIORITY} from '../constants/index.js'
import {inspectArgs, inspectFlags} from '../flargs/inspect.js'
import {Confirm, RunnerConsole, RunnerLogs} from '../types/index.js'
import {
  configureContainerRuntime,
  filterByInstalledApps,
  parseFlags,
  sortArrayBasedOnOrder,
} from '../utils/index.js'

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
  confirm: Confirm
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
  const {confirm, console, cwd, env: runnerEnv, logs = {error: [], log: [], warn: []}} = runnerOptions

  const arch = os.arch()
  const {env: processEnv, platform} = process
  const flags = {...options}

  if (flags['container-runtime']) {
    const availableContainerRuntimes = await filterByInstalledApps([flags['container-runtime']], platform)

    if (availableContainerRuntimes.length === 0) {
      console.error(`${flags['container-runtime']} is not installed.`)
    }
  } else {
    const availableContainerRuntimes = await filterByInstalledApps(CONTAINER_RUNTIMES_IN_PRIORITY, platform)

    if (availableContainerRuntimes.length === 0) {
      console.error('No available container runtime available in the system.')
    }

    const containerRuntimesInPriorityOrder = sortArrayBasedOnOrder(
      availableContainerRuntimes,
      CONTAINER_RUNTIMES_IN_PRIORITY,
    )

    flags['container-runtime'] = containerRuntimesInPriorityOrder[0]
    console.warn(`You haven't specified a container runtime, using the: ${flags['container-runtime']}`)
  }

  const containerRuntime = flags['container-runtime']

  delete flags['container-runtime']

  const packConfiguration = await configureContainerRuntime(
    containerRuntime,
    {
      arch,
      platform,
    },
    console,
    confirm,
  )

  const argvs = [imageName]

  const flargs = parseFlags(flags)

  argvs.push(...flargs)

  await Parser.parse(argvs, {args: inspectArgs, flags: inspectFlags})

  const packArgs = ['inspect', ...argvs, ...packConfiguration.flags]

  const execOptions = {
    cwd,
    env: {
      ...processEnv,
      ...packConfiguration.envs,
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
