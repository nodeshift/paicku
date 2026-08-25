# Paicku

Paicku is a Node.js wrapper around Cloud Native Buildpacks' [pack CLI](https://github.com/buildpacks/pack). It turns your app into a container image from the command line, or from a test, without you installing pack yourself.

- **CLI and library.** Run `npx paicku build`, or call `createPaicku()` from Node.js to build, start, and HTTP-test the image.
- **Docker or Podman.** Uses whichever runtime is installed; pin one with `--container-runtime`.
- **No pack install.** Downloads pack into the CLI cache on first run.
- **Defaults that produce an image.** A random image name and the Paketo builder `docker.io/paketobuildpacks/builder-ubi8-base` if you omit them.
- **Node.js >= 22**

```javascript
import {createPaicku} from 'paicku'

const paicku = createPaicku()

const image = await paicku.build({ path: './app' })

const container = await image.run({exposedPorts: 8080})

try {
  const response = await fetch(container.getUrl())
  console.log(await response.text()) //=> your app's homepage
} finally {
  await container.stop()
}
```

## Table of Contents

- [Getting started](#getting-started)
  - [CLI](#cli)
  - [Library](#library)
- [Programmatic API](#programmatic-api)
- [CLI reference](#cli-reference)
- [Examples](#examples)
- [Contributing](#contributing)

## Getting started

You need **Node.js 22+** and **Docker or Podman**.

### CLI

Build the app in the current directory into a **local** image (not a registry) with a generated name:

```sh
cd ./my-node-app
npx paicku build
```

Or install globally and pass an image name and path:

```sh
npm install -g paicku
paicku build my-app --path /path/to/app
```

Use `--publish` only when you want pack to push the image to the registry in the image name.

### Library

```sh
npm install paicku
```

```javascript
import {createPaicku} from 'paicku'

const paicku = createPaicku()
const image = await paicku.build({path: './app'})
const container = await image.run({exposedPorts: 8080})
const response = await fetch(container.getUrl())
console.log(await response.text()) //=> your app's homepage
await container.stop()
```

Every CLI command has a matching method on the client returned by `createPaicku()`.

## Programmatic API

```javascript
const paicku = createPaicku({
  cwd: process.cwd(), // optional working directory for pack
  executablePath: '/path/to/pack', // optional; otherwise pack is downloaded
})
```

`paicku.build()` returns a built image. Call `image.run()` to start it with [testcontainers](https://testcontainers.com/). Pass `exposedPorts` when you need a URL — there is no default port.

```javascript
const container = await image.run({exposedPorts: 8080})

container.getUrl() // http://host:mappedPort
container.getUrl({port: 9090, scheme: 'https'})
await container.logs()
await container.stop()
```

With Mocha and SuperTest:

```javascript
import {expect} from 'chai'
import {after, before, describe, it} from 'mocha'
import request from 'supertest'
import {createPaicku} from 'paicku'

describe('my app', () => {
  const paicku = createPaicku()
  let image
  let container

  before(async () => {
    image = await paicku.build({path: './app'})
  })

  after(async () => {
    await container?.stop()
  })

  it('serves the homepage', async () => {
    container = await image.run({exposedPorts: 8080})
    const response = await request(container.getUrl()).get('/')
    expect(response.status).to.equal(200)
  })
})
```

See `examples/programmatic/` for complete scripts.

## CLI reference

Flag-level help for each command is in `docs/`.

<!-- commands -->
# Command Topics

* [`paicku build`](docs/build.md) - Build an image
* [`paicku builder`](docs/builder.md) - Display suggested builders for the given application
* [`paicku help`](docs/help.md) - Display help for paicku.
* [`paicku inspect`](docs/inspect.md) - Show information about a built app image
* [`paicku sbom`](docs/sbom.md) - Interact with SBoM

<!-- commandsstop -->

## Examples

Programmatic snippets assume `const paicku = createPaicku()`.

### Build with Podman

```sh
paicku build my-app --container-runtime podman
```

```javascript
const result = await paicku.build({
  imageName: 'my-app',
  'container-runtime': 'podman',
})
```

### Build with a specific builder

```sh
paicku build my-image --builder docker.io/paketobuildpacks/builder-ubi8-base
```

```javascript
const result = await paicku.build({
  imageName: 'my-image',
  builder: 'docker.io/paketobuildpacks/builder-ubi8-base',
})
```

The builder must include a registry prefix (`docker.io/`, `ghcr.io/`, …).

### Build from a remote Git repository

Append `:<subdirectory>` to the Git URL when the app is not at the repository root.

```sh
paicku build backend-image --path https://github.com/nodeshift/mern-workshop:backend
```

```javascript
const result = await paicku.build({
  imageName: 'backend-image',
  path: 'https://github.com/nodeshift/mern-workshop:backend',
})
```

### Build with environment variables

```sh
paicku build my-app --env BP_NODE_VERSION=18.*
```

```javascript
const result = await paicku.build({
  imageName: 'my-app',
  env: ['BP_NODE_VERSION=18.*'],
})
```

### Inspect a built image

```sh
paicku inspect my-image:latest --output json
```

```javascript
const result = await paicku.inspect('my-image:latest', {
  output: 'json',
})

console.log(result.parsedStdout)
```

### Suggest a builder

```sh
paicku builder suggest
```

```javascript
const result = await paicku.builder.suggest()
console.log(result.stdout)
```

### Download an SBOM

```sh
paicku sbom download my-image:latest --output-dir ./sbom
```

```javascript
await paicku.sbom.download('my-image:latest', {
  'output-dir': './sbom',
})
```

## Contributing

Contributions are welcome. Open a pull request.

### Development

```sh
npm install
```

Run the CLI against source:

```sh
./bin/dev.js
./bin/dev.js build test/integration/testdata/nodejs_simple_app --container-runtime podman
```

Production mode needs a build first:

```sh
npm run build
./bin/run.js
```

Rebuild after changing source.

### Testing

```sh
npm run test
```

Integration tests (require Docker or Podman):

```sh
npm run integration:test:podman
npm run integration:test:docker
```

Debug unit tests (`--timeout 0`, useful with `.only`):

```sh
npm run unit:test:debug
```

Coverage:

```sh
npm run test:report
```
