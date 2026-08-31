export type PaickuErrorOptions = {
  command?: string
  exitCode?: number
  stderr?: string[]
  stdout?: string[]
  warnings?: string[]
}

export class PaickuError extends Error {
  readonly command?: string
  readonly exitCode: number
  readonly stderr: string[]
  readonly stdout: string[]
  readonly warnings: string[]

  constructor(message: string, options: PaickuErrorOptions = {}) {
    super(formatPaickuErrorMessage(message, options))
    this.name = 'PaickuError'
    this.command = options.command
    this.exitCode = options.exitCode ?? 1
    this.stderr = options.stderr ?? []
    this.stdout = options.stdout ?? []
    this.warnings = options.warnings ?? []
  }
}

function formatPaickuErrorMessage(message: string, options: PaickuErrorOptions): string {
  if (options.exitCode !== undefined) {
    return message ? `${message} (exit code ${options.exitCode})` : `(exit code ${options.exitCode})`
  }

  return message
}
