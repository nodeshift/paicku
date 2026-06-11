export interface Flags {
  [key: string]: boolean | number | string | string[]
}

export interface Envs {
  [key: string]: string
}

export type RunnerConsole = {
  error: (message: string, options?: {exit?: number}) => never
  log: (message: string) => void
  warn: (message: string) => void
}
