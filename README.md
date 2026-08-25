# Paicku

Paicku is a Node.js wrapper around Cloud Native Buildpacks' [pack CLI](https://github.com/buildpacks/pack). It turns your app into a container image from the command line, or from a test, without you installing pack yourself.

- **CLI and library.** Run `npx paicku build`, or call `await paicku.build()` from Node.js to build, start, and test your containerized application.
- **Docker or Podman.** Uses whichever runtime is installed; pin one with `--container-runtime`.
- **No pack install.** Downloads pack into the CLI cache on first run.
- **Defaults that produce an image.** A random image name and the Paketo builder `docker.io/paketobuildpacks/builder-ubi8-base` if you omit them.
- **Node.js >= 22**

## Getting started

### Library

```sh
npm install paicku --save-dev
```

Without any testing framework

```javascript
import {createPaicku} from 'paicku'

const paicku = createPaicku()

// returns your containerized application image
const image = await paicku.build({path: './app'})

// run the image using testcontainers - https://testcontainers.com
const container = await image.run({exposedPorts: 8080})

try {
  // Do a request to the running container application
  const response = await fetch(container.getUrl())

  // Print the response
  console.log(await response.text())
} finally {
  await container.stop()
}
```

See [examples/programmatic/](examples/programmatic/) for complete scripts.

### CLI

```sh
npx paicku build --path ./app
```

Or install it globally

```sh
npm install -g paicku
paicku build my-app-name --path ./app
```

<!-- commands -->

# Command Topics

- [`paicku build`](docs/build.md) - Build an image
- [`paicku builder`](docs/builder.md) - Display suggested builders for the given application
- [`paicku help`](docs/help.md) - Display help for paicku.
- [`paicku inspect`](docs/inspect.md) - Show information about a built app image
- [`paicku sbom`](docs/sbom.md) - Interact with SBoM

<!-- commandsstop -->

## Examples

With Mocha and SuperTest:

```javascript
import {expect} from 'chai'
import {after, before, describe, it} from 'mocha'
import request from 'supertest'
import {createPaicku} from 'paicku'

describe('my app', () => {
  // Configure paicku
  const paicku = createPaicku()
  let image
  let container

  before(async () => {
    // returns your containerized application image
    image = await paicku.build({path: './app'})
  })

  after(async () => {
    await container?.stop()
  })

  it('serves the homepage', async () => {
    // run the image using testcontainers - https://testcontainers.com
    container = await image.run({exposedPorts: 8080})
    // do a request with supertest
    const response = await request(container.getUrl()).get('/')
    // evaluate the response
    expect(response.status).to.equal(200)
  })
})
```

See [examples/programmatic/](examples/programmatic/) for complete scripts.

Configuring default behaviour of paicku

```javascript
const paicku = createPaicku({
  cwd: process.cwd(), // optional working directory for pack
  executablePath: '/path/to/pack', // optional, otherwise default pack is downloaded
})
```

Pass `exposedPorts` when you need a URL as there is no default port.

```javascript
const container = await image.run({exposedPorts: 8080})

container.getUrl()
container.getUrl({port: 9090, scheme: 'https'})
await container.logs()
await container.stop()
```

The folloing programmatic snippets assume `const paicku = createPaicku()`.

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
