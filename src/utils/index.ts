import {confirm} from '@inquirer/prompts'
import {lookpath} from 'lookpath'
import {execFileSync, spawn} from 'node:child_process'
import {existsSync, lstatSync, mkdirSync, mkdtempSync} from 'node:fs'
import path, {join} from 'node:path'
import url from 'node:url'

import {CLONED_REPOS_TMP_DIRNAME} from '../constants/index.js'
import {Envs, EnvsForRun, Flags, RunnerConsole} from '../types/index.js'

export function getPackUrl(platform: string, arch: string, packVersion: string) {
  const packNamingConvention = getPackNamingConvention(arch, platform)

  const compression = platform === 'win32' ? 'zip' : 'tgz'

  const GITHUB_BASE_URL = process.env.PAICKU_GITHUB_BASE_URL || 'https://github.com'
  return [
    GITHUB_BASE_URL,
    'buildpacks',
    'pack',
    'releases',
    'download',
    `v${packVersion}`,
    `pack-v${packVersion}-${packNamingConvention}.${compression}`,
  ].join('/')
}

export function getPackNamingConvention(arch: string, platform: string): string {
  if (platform === 'linux') {
    switch (arch) {
      case 'arm64': {
        return 'linux-arm64'
      }
      // by default we set it to ppc64le

      case 'ppc64': {
        return 'linux-ppc64le'
      }

      case 's390x': {
        return 'linux-s390x'
      }

      case 'x64': {
        return 'linux'
      }

      default: {
        throw new Error(`Unsupported architecture: ${arch} for ${platform}`)
      }
    }
  }

  if (platform === 'darwin') {
    if (arch === 'x64') {
      return 'macos'
    }

    if (arch === 'arm64') {
      return 'macos-arm64'
    }

    throw new Error(`Unsupported architecture: ${arch} for darwin`)
  }

  if (platform === 'win32') {
    if (arch === 'x64') {
      return 'windows'
    }

    throw new Error(`Unsupported architecture: ${arch} for windows`)
  }

  throw new Error(`Unsupported platform/architecture: ${platform}/${arch}`)
}

// Returns true when the builder image is explicitly prefixed with a registry host.
export function hasRegistryPrefix(builder: string): boolean {
  const firstSlash = builder.indexOf('/')
  if (firstSlash === -1) {
    return false
  }

  const firstSegment = builder.slice(0, firstSlash)
  return firstSegment === 'localhost' || firstSegment.includes('.') || firstSegment.includes(':')
}

export function parseFlags(flags: Flags): string[] {
  // iterate over the flags and add them to an array
  const flagsArray: string[] = []

  for (const [key, value] of Object.entries(flags)) {
    if (typeof value === 'boolean') {
      if (value) {
        flagsArray.push(`--${key}`)
      }
    } else if (Array.isArray(value)) {
      for (const item of value) {
        flagsArray.push(`--${key}`, item.toString())
      }
    } else {
      flagsArray.push(`--${key}`, value.toString())
    }
  }

  return flagsArray
}

export async function parseGitRemoteRepo(
  path: string,
): Promise<{context: string; gitURL: string; isGitRemoteRepo: boolean}> {
  // If is a URL extract the context
  const [urlOrPath, context = '.'] = path.split(/:(?!\/\/)/)
  const url = parseURL(urlOrPath)
  if (url) {
    try {
      // Validate is a git repository
      execFileSync('git', ['ls-remote', '--heads', urlOrPath, 'HEAD'])
      return {context, gitURL: url.href, isGitRemoteRepo: true}
    } catch (error) {
      if (error instanceof Error) {
        throw new TypeError(error.message)
      }

      throw new Error('The provided URL is not a git repository')
    }
  }

  let isDir
  try {
    isDir = lstatSync(urlOrPath).isDirectory()
  } catch {
    isDir = false
  }

  // If is not a directory, is a tar or a tgz file, or an invalid path
  // In that case we let pack throw the error
  if (!isDir) {
    return {context, gitURL: '', isGitRemoteRepo: false}
  }

  // We want to validate if the directory is a local repository or a local remote repository
  const remotes = execFileSync('git', ['-C', urlOrPath, 'remote', '-v'])

  // Heuristic way:
  // If it has at least one remote 99.9% is a local repository
  if (remotes.length > 0) {
    return {context: '', gitURL: '', isGitRemoteRepo: false}
  }

  // Otherwise is a local remote repository
  return {context, gitURL: urlOrPath, isGitRemoteRepo: true}
}

export function gitIsInstalled(): boolean {
  try {
    execFileSync('git', ['--version'])
    return true
  } catch {
    return false
  }
}

export async function cloneRepo(
  remoteURL: string,
  cacheDir: string,
  log: (message: string) => void,
  errorLog: (message: string, options?: {exit: number}) => void,
): Promise<string> {
  if (!gitIsInstalled()) {
    errorLog('Git is not installed in the system, please install it to clone a remote repository')
  }

  const clonedReposDirPath = join(cacheDir, CLONED_REPOS_TMP_DIRNAME)

  try {
    if (!existsSync(clonedReposDirPath)) {
      mkdirSync(clonedReposDirPath)
    }
  } catch {
    errorLog('Error creating directory in cache', {exit: Number(1)})
  }

  const repoName = path.basename(remoteURL, '.git')

  let clonedRepoPath = ''
  try {
    clonedRepoPath = mkdtempSync(join(clonedReposDirPath, `${repoName}-`))
  } catch {
    errorLog('Error creating temporary directory dir in cache', {exit: Number(1)})
  }

  const bin = spawn('git', ['clone', '--depth', '1', remoteURL, clonedRepoPath])

  log(`Cloning the repository... into ${clonedRepoPath}`)

  let errorChunks = ''
  for await (const errorChunk of bin.stderr) {
    errorChunks += errorChunk
  }

  const exitCode = await new Promise<number>((resolve) => {
    bin.on('close', resolve)
  })

  if (exitCode) {
    errorLog(errorChunks.toString(), {exit: Number(exitCode)})
  }

  log('Repository cloned successfully')
  return clonedRepoPath
}

export function parseURL(url: string): URL | null {
  try {
    const parsedURL = new URL(url)
    return parsedURL
  } catch {
    return null
  }
}

export async function filterByInstalledApps(apps: string[], platform: string): Promise<string[]> {
  switch (platform) {
    case 'linux':
    case 'darwin': {
      try {
        const result = await Promise.all(
          apps.map(async (app) => {
            const appExist = await lookpath(app)
            return appExist ? app : null
          }),
        ).then((results) => results.filter((app) => app !== null))
        return result
      } catch {
        return []
      }
    }

    case 'win32': {
      try {
        const result = apps.filter((app) => {
          try {
            execFileSync('where', [app], {stdio: 'pipe'})
            return true
          } catch {
            return false
          }
        })
        return result
      } catch {
        return []
      }
    }
  }

  return []
}

export function sortArrayBasedOnOrder(array: string[], order: string[]): string[] {
  return array.sort((a, b) => order.indexOf(a) - order.indexOf(b))
}

// eslint-disable-next-line complexity
export async function configureContainerRuntime(
  containerRuntime: string,
  target: {arch: string; platform: string},
  console: RunnerConsole,
): Promise<{envs: Envs; envsForRun: EnvsForRun; flags: string[]}> {
  if (containerRuntime === 'podman' && target.platform === 'darwin' && target.arch === 'arm64') {
    return configurePodmanOnDarwinArm64(console)
  }

  if (containerRuntime === 'podman' && target.platform === 'darwin' && target.arch === 'x64') {
    // We use the same configuration for both darwin arm64 and x64
    return configurePodmanOnDarwinArm64(console)
  }

  if (containerRuntime === 'docker' && target.platform === 'darwin' && target.arch === 'arm64') {
    return configureDockerOnDarwinArm64()
  }

  if (containerRuntime === 'docker' && target.platform === 'darwin' && target.arch === 'x64') {
    // we use the same configuration for both darwin arm64 and x64
    return configureDockerOnDarwinArm64()
  }

  if (containerRuntime === 'docker' && target.platform === 'linux' && target.arch === 'x64') {
    return configureDockerOnLinuxAmd64()
  }

  if (containerRuntime === 'podman' && target.platform === 'linux' && target.arch === 'x64') {
    return configurePodmanOnLinuxAmd64()
  }

  if (containerRuntime === 'docker' && target.platform === 'linux' && target.arch === 'arm64') {
    // we use the same configuration for both linux arm64 and x64
    return configureDockerOnLinuxAmd64()
  }

  if (containerRuntime === 'podman' && target.platform === 'linux' && target.arch === 'arm64') {
    // we use the same configuration for both linux arm64 and x64
    return configurePodmanOnLinuxAmd64()
  }

  console.error(`Building apps with paicku on ${target.platform} ${target.arch} is not yet supported`)
}

function configurePodmanOnLinuxAmd64(): {envs: Envs; envsForRun: EnvsForRun; flags: string[]} {
  const podmandInfo = execFileSync('podman', ['info', '-f', '{{.Host.RemoteSocket.Path}}'], {
    encoding: 'utf8',
  })

  execFileSync('systemctl', ['--user', 'start', 'podman.socket'], {encoding: 'utf8'})

  return {
    envs: {DOCKER_HOST: `unix://${podmandInfo.trim()}`},
    envsForRun: {DOCKER_HOST: `unix://${podmandInfo.trim()}`},
    flags: ['--docker-host', 'inherit'],
  }
}

function configureDockerOnLinuxAmd64(): {envs: Envs; envsForRun: EnvsForRun; flags: string[]} {
  return {envs: {}, envsForRun: {}, flags: []}
}

function configureDockerOnDarwinArm64(): {envs: Envs; envsForRun: EnvsForRun; flags: string[]} {
  return {envs: {}, envsForRun: {}, flags: []}
}

// eslint-disable-next-line complexity
async function configurePodmanOnDarwinArm64(
  console: RunnerConsole,
): Promise<{envs: Envs; envsForRun: EnvsForRun; flags: string[]}> {
  let listPodmanConnections
  try {
    const podmandSystemConnectionLsCommand = execFileSync(
      'podman',
      ['system', 'connection', 'ls', '--format="{{.URI}} {{.Identity}}"'],
      {
        encoding: 'utf8',
      },
    )

    listPodmanConnections = podmandSystemConnectionLsCommand
      .split('\n')
      .map((line) => line.slice(1, -1))
      .find((line) => line.includes('root'))

    if (!listPodmanConnections) {
      console.error('Ensure you have installed podman correctly.')
    }
  } catch {
    console.error('Ensure you have installed podman correctly.')
  }

  let isPodmanRootless: boolean
  try {
    const hostSecurityRootless = execFileSync('podman', ['info', '--format="{{.Host.Security.Rootless}}"'], {
      encoding: 'utf8',
    })

    isPodmanRootless = hostSecurityRootless.trim() === 'true'
  } catch {
    console.error('Ensure you have installed podman correctly.')
  }

  try {
    execFileSync('podman', ['container', 'ls'], {
      encoding: 'utf8',
    })
  } catch {
    console.error('Ensure you have installed podman correctly.')
  }

  const podmanMachineUri = url.parse(listPodmanConnections.split(' ')[0])
  const identityFilepath = listPodmanConnections.split(' ')[1]

  if (
    !podmanMachineUri ||
    !identityFilepath ||
    !podmanMachineUri.port ||
    !podmanMachineUri.protocol ||
    !podmanMachineUri.host ||
    !podmanMachineUri.auth ||
    !podmanMachineUri.pathname
  ) {
    console.error('Ensure you have installed podman correctly.')
  }

  let isSshKeyLoaded = false
  let listLoadedSshKeys = ''
  try {
    listLoadedSshKeys = execFileSync('ssh-add', ['-l'], {encoding: 'utf8'})
    const keyInfo = execFileSync('ssh-keygen', ['-l', '-f', identityFilepath], {encoding: 'utf8'})
    if (listLoadedSshKeys.includes(keyInfo.split(' ')[1])) {
      isSshKeyLoaded = true
    }
  } catch {
    listLoadedSshKeys = ''
  }

  if (!isSshKeyLoaded) {
    const loadSshKeyAnswer = await confirm({
      default: false,
      message: 'Would you like to add Podman key to ssh-agent for accessing Podman machine?',
    })

    if (loadSshKeyAnswer) {
      execFileSync('ssh-add', ['-k', identityFilepath])
    } else {
      console.error('SSH key is required to access Podman machine. Please add it to ssh-agent to continue.')
    }
  }

  // pack embedded SSH dialer only ever reads the default ~/.ssh/known_hosts file
  const knownHostsPath = path.join(process.env.HOME || '~', '.ssh', 'known_hosts')

  // We check on the known_hosts file if the host is already there
  // if not we fall to the catch block and we add it through ssh command.
  try {
    execFileSync('ssh-keygen', ['-F', `[${podmanMachineUri.hostname}]:${podmanMachineUri.port}`, '-f', knownHostsPath])
  } catch {
    const addHostAnswer = await confirm({
      default: true,
      message: `The Podman machine host is not in your known_hosts file. Do you want to add it automatically?`,
    })
    if (!addHostAnswer) {
      console.error('Podman machine host is required to be in known_hosts file. Aborting configuration.')
      return {envs: {}, envsForRun: {}, flags: []}
    }

    // Get the fingerprint with ssh command from the Podman machine host.
    let podmanMachineSshFingerprint: string
    try {
      console.log('Fetching secure fingerprint directly from Podman machine host...')
      podmanMachineSshFingerprint = execFileSync(
        'podman',
        ['machine', 'ssh', 'ssh-keygen -l -f /etc/ssh/ssh_host_ecdsa_key.pub'],
        {encoding: 'utf8'},
      )
    } catch (error) {
      console.error(`Failed to fetch fingerprint from Podman machine host: ${error}`)
    }

    // Get the fingerprint with ssh-keyscan from the Podman machine host.
    let podmanPublicKey: string
    try {
      podmanPublicKey = execFileSync(
        'ssh-keyscan',
        ['-t', 'ecdsa', '-p', podmanMachineUri.port || '22', podmanMachineUri.hostname || '127.0.0.1'],
        {encoding: 'utf8'},
      )
    } catch (error) {
      console.error(`Failed to scan Podman machine host fingerprint: ${error}`)
    }

    let podmanPublicKeyToFingerprint: string
    try {
      podmanPublicKeyToFingerprint = execFileSync('ssh-keygen', ['-lf', '-'], {
        encoding: 'utf8',
        input: podmanPublicKey.split('\n')[1],
      })
    } catch (error) {
      console.error(`Failed to get fingerprint: ${error}`)
    }

    if (podmanPublicKeyToFingerprint.split(' ')[1] !== podmanMachineSshFingerprint.split(' ')[1]) {
      console.error('Podman machine host fingerprint does not match the public key fingerprint.')
    }

    try {
      const fs = await import('node:fs/promises')
      await fs.appendFile(knownHostsPath, podmanPublicKey)
    } catch (error) {
      console.error(`Failed to write to known_hosts file: ${error}`)
    }
  }

  const envsForRun = {
    DOCKER_HOST: podmanMachineUri.href,
    TESTCONTAINERS_DOCKER_SOCKET_OVERRIDE: '/var/run/docker.sock',
    ...(isPodmanRootless ? {TESTCONTAINERS_RYUK_DISABLED: 'true'} : {TESTCONTAINERS_RYUK_PRIVILEGED: 'true'}),
  }

  return {
    envs: {DOCKER_HOST: podmanMachineUri.href},
    envsForRun,
    flags: ['--docker-host', 'inherit'],
  }
}
