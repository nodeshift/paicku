import {GenericContainer, type StartedTestContainer, Wait} from 'testcontainers'

import {type Envs, type EnvsForRun} from '../types/index.js'

export type ExposedPort = number | string
export type ExposedPorts = ExposedPort | ExposedPort[]

export type BuiltImageRunOptions = {
  envs?: Envs
  exposedPorts?: ExposedPorts
  startupTimeoutMs?: number
  wait?: {path?: string; statusCode?: number} | false
}

function normalizeExposedPorts(exposedPorts: ExposedPorts): number[] {
  const values = Array.isArray(exposedPorts) ? exposedPorts : [exposedPorts]

  if (values.length === 0) {
    throw new Error('exposedPorts must include at least one port')
  }

  return values.map((port) => {
    const numericPort = typeof port === 'number' ? port : Number(port)

    if (!Number.isInteger(numericPort) || numericPort < 1 || numericPort > 65_535) {
      throw new Error(`Invalid exposed port: ${port}`)
    }

    return numericPort
  })
}

type RunOptions = {
  envsForRun?: EnvsForRun
  imageName: string
} & BuiltImageRunOptions

export interface RunningContainer {
  stop(): Promise<void>
  url: string | undefined
}

interface RunResult extends RunningContainer {
  buildUrl(options: {port: number; scheme?: string}): string
  container: StartedTestContainer
  getFirstMappedPort(): number
  getMappedPort(containerPort: number): number
  host: string
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
  const {envs, envsForRun, exposedPorts = 8080, imageName, startupTimeoutMs, wait} = options
  const ports = normalizeExposedPorts(exposedPorts)

  applyRuntimeEnv(envsForRun)

  let container = new GenericContainer(imageName).withExposedPorts(...ports)

  if (envs) {
    container = container.withEnvironment(envs)
  }

  if (wait !== false) {
    const waitPath = wait?.path ?? '/'
    const statusCode = wait?.statusCode ?? 200
    container = container.withWaitStrategy(Wait.forHttp(waitPath, ports[0]).forStatusCode(statusCode))
  }

  if (startupTimeoutMs !== undefined) {
    container = container.withStartupTimeout(startupTimeoutMs)
  }

  const started = await container.start()

  const primaryPort = ports && ports.length > 0 ? ports[0] : undefined
  const primaryMappedPort = primaryPort ? started.getMappedPort(primaryPort) : undefined
  const host = started.getHost()

  return {
    buildUrl({port, scheme = 'http'}: {port: number; scheme?: string}) {
      return `${scheme}://${host}:${started.getMappedPort(port)}`
    },
    container: started,
    getFirstMappedPort() {
      if (!primaryPort) {
        throw new Error('No ports were exposed during the run command.')
      }

      return started.getMappedPort(primaryPort)
    },
    getMappedPort(containerPort: number) {
      return started.getMappedPort(containerPort)
    },
    host: started.getHost(),
    async stop() {
      await started.stop()
    },

    url: primaryMappedPort ? `http://${host}:${primaryMappedPort}` : undefined,
  }
}
