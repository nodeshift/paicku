import {GenericContainer, type StartedTestContainer, Wait} from 'testcontainers'

import {type EnvsForRun} from '../types/index.js'

export type StartOptions = {
  environment?: Record<string, string>
  envsForRun?: EnvsForRun
  imageName: string
  port?: number
  startupTimeoutMs?: number
  wait?: {path?: string; statusCode?: number} | false
}

export interface StartResult {
  container: StartedTestContainer
  host: string
  port: number
  stop(): Promise<void>
  url: string
}

type StartRunnerOptions = {
  env?: Record<string, string | undefined>
}

function applyRuntimeEnv(envsForRun?: EnvsForRun, extraEnv?: Record<string, string | undefined>): void {
  const envToApply = {...envsForRun, ...extraEnv}

  for (const [key, value] of Object.entries(envToApply)) {
    if (value !== undefined) {
      process.env[key] = value
    }
  }
}

export async function runStart(options: StartOptions, runnerOptions: StartRunnerOptions = {}): Promise<StartResult> {
  const {environment, envsForRun, imageName, port = 8080, startupTimeoutMs, wait} = options

  applyRuntimeEnv(envsForRun, runnerOptions.env)

  let container = new GenericContainer(imageName).withExposedPorts(port)

  if (environment) {
    container = container.withEnvironment(environment)
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
