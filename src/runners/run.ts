import {GenericContainer, type StartedTestContainer, Wait} from 'testcontainers'

import {type Envs, type EnvsForRun} from '../types/index.js'

export type BuiltImageRunOptions = {
  envs?: Envs
  port?: number
  startupTimeoutMs?: number
  wait?: {path?: string; statusCode?: number} | false
}

type RunOptions = {
  envsForRun?: EnvsForRun
  imageName: string
} & BuiltImageRunOptions

export interface RunningContainer {
  stop(): Promise<void>
  url: string
}

interface RunResult extends RunningContainer {
  container: StartedTestContainer
  host: string
  port: number
}

function applyRuntimeEnv(envsForRun?: EnvsForRun): void {
  if (!envsForRun) {
    return
  }

  for (const [key, value] of Object.entries(envsForRun)) {
    if (value !== undefined) {
      process.env[key] = value
    }
  }
}

export async function run(options: RunOptions): Promise<RunResult> {
  const {envs, envsForRun, imageName, port = 8080, startupTimeoutMs, wait} = options

  applyRuntimeEnv(envsForRun)

  let container = new GenericContainer(imageName).withExposedPorts(port)

  if (envs) {
    container = container.withEnvironment(envs)
  }

  if (wait !== false) {
    const waitPath = wait?.path ?? '/'
    const statusCode = wait?.statusCode ?? 200
    container = container.withWaitStrategy(Wait.forHttp(waitPath, port).forStatusCode(statusCode))
  }

  if (startupTimeoutMs !== undefined) {
    container = container.withStartupTimeout(startupTimeoutMs)
  }

  const started = await container.start()
  const host = started.getHost()
  const mappedPort = started.getMappedPort(port)

  return {
    container: started,
    host,
    port: mappedPort,
    async stop() {
      await started.stop()
    },
    url: `http://${host}:${mappedPort}`,
  }
}
