import {chmod, writeFile} from 'node:fs/promises'
import {join} from 'node:path'

export async function setupFakePack(dir: string, output: string): Promise<string> {
  const packPath = join(dir, 'pack')
  await writeFile(packPath, `#!/bin/sh\nprintf '%s\\n' '${output}'\n`)
  await chmod(packPath, 0o755)
  return packPath
}
