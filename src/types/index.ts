import {type BuildOptions} from '../runners/build.js'

export interface Flags {
  [key: string]: boolean | number | string | string[]
}

export interface EnvsForRun {
  DOCKER_HOST?: string
  TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE?: string
  TESTCONTAINERS_RYUK_DISABLED?: string
  TESTCONTAINERS_RYUK_PRIVILEGED?: string
}
export interface Envs {
  [key: string]: string
}

export type RunnerLogs = {
  error: string[]
  log: string[]
  warn: string[]
}

export type PaickuBuildOptions = {
  imageName?: string
} & BuildOptions

export type RunnerConsole = {
  error: (message: string, options?: {exit?: number}) => never
  log: (message: string) => void
  logToStderr: (message: string) => void
  warn: (message: string) => void
}

export function createRunnerConsole(logs: RunnerLogs): RunnerConsole {
  return {
    error(message: string): never {
      logs.error.push(message)
      throw new Error(message)
    },
    log(message: string) {
      logs.log.push(message)
    },
    logToStderr(message: string) {
      logs.warn.push(message)
    },
    warn(message: string) {
      logs.warn.push(message)
    },
  }
}
