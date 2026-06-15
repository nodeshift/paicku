# paicku

Paicku is a wrapper of [pack CLI](https://github.com/buildpacks/pack) for containerizing applications using buildpacks, in a little bit easier way which can also be called programmatically for testing locally your application.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/paicku.svg)](https://npmjs.org/package/paicku)
[![Downloads/week](https://img.shields.io/npm/dw/paicku.svg)](https://npmjs.org/package/paicku)

## Table of Contents

- [Usage](#usage)
  - [Calling via CLI](#calling-via-cli)
  - [Calling it Programmatically](#calling-it-programmatically)
    - [Build and run an image](#build-and-run-an-image)
- [Available commands](#available-commands)
- [Command Topics](#command-topics)
  - [Examples](#examples)
- [Contributing](#contributing)
  - [Development](#development)
  - [Run CLI in Development Mode](#run-cli-in-development-mode)
  - [Run CLI in Production Mode](#run-cli-in-production-mode)
  - [Testing](#testing)

# Usage

## Calling via CLI

Install globally:

```sh
npm install -g paicku
```

Or use npx (no installation required):

```sh
cd ./my-node-app-dir
npx paicku build
```

The above command will output a container image to your registry with a random name.

Specify a custom image name and a path:

```sh
paicku build my-image-name --path /path/to/my/app/dir
```

## Calling it Programmatically

All the commands that Paicku supports, can be called programmatically.

### Build and run an image

```javascript
import {createPaicku} from 'paicku'

const paicku = createPaicku()

const result = await paicku.build({
  imageName: 'my-app',
  path: './app',
  builder: 'docker.io/paketobuildpacks/builder-ubi8-base',
})

if (result.failed) {
  console.error('Build failed:', result.stderr)
  process.exit(1)
}

const started = await paicku.start({
  imageName: buildResult.imageName,
  envsForRun: buildResult.envsForRun,
  port: 8080,
})

console.log(`Container started at ${started.url}`)

// Make a request
const response = await fetch(started.url)
console.log('Response:', await response.text())

// Stop the container
await started.stop()
```

# Available commands

<!-- commands -->

# Command Topics

- [`paicku build`](docs/build.md) - Build an image
- [`paicku builder`](docs/builder.md) - Display suggested builders for the given application
- [`paicku help`](docs/help.md) - Display help for paicku.
- [`paicku inspect`](docs/inspect.md) - Show information about a built app image
- [`paicku sbom`](docs/sbom.md) - Interact with SBoM

<!-- commandsstop -->

### Examples

#### Build with podman

```sh
paicku build my-app --container-runtime podman
```

```javascript
import {createPaicku} from 'paicku'

const paicku = createPaicku()

const result = await paicku.build({
  imageName: 'my-app',
  'container-runtime': 'podman',
})
```

#### Build with a specific builder

```sh
paicku build my-image --builder docker.io/paketobuildpacks/builder-ubi8-base
```

```javascript
import {createPaicku} from 'paicku'

const paicku = createPaicku()

const result = await paicku.build({
  imageName: 'my-image',
  builder: 'docker.io/paketobuildpacks/builder-ubi8-base',
})
```

#### Build from a remote Git repository

```sh
paicku build backend-image --path https://github.com/nodeshift/mern-workshop --context-dir backend
```

```javascript
import {createPaicku} from 'paicku'

const paicku = createPaicku()

const result = await paicku.build({
  imageName: 'backend-image',
  path: 'https://github.com/nodeshift/mern-workshop:backend',
})
```

#### Build with environment variables

```sh
paicku build my-app --env BP_NODE_VERSION=18.*
```

```javascript
import {createPaicku} from 'paicku'

const paicku = createPaicku()

const result = await paicku.build({
  imageName: 'my-app',
  env: ['BP_NODE_VERSION=18.*'],
})
```

#### Inspect a built image

```sh
paicku inspect my-image:latest
```

```javascript
import {createPaicku} from 'paicku'

const paicku = createPaicku()

const result = await paicku.inspect('my-image:latest', {
  output: 'json',
})

if (!result.failed) {
  console.log('Image information:', result.parsedStdout)
}
```

#### Get builder suggestions

```sh
paicku builder suggest
```

```javascript
import {createPaicku} from 'paicku'

const paicku = createPaicku()

const result = await paicku.builder.suggest()

if (result.failed) {
  console.error('Command failed:', result.stderr)
} else {
  console.log('Suggested builders:', result.stdout)
}
```

#### Download SBOM

```sh
paicku sbom download my-image:latest --output-dir ./sbom
```

```javascript
import {createPaicku} from 'paicku'

const paicku = createPaicku()

const result = await paicku.sbom.download('my-image:latest', {
  'output-dir': './sbom',
})

if (!result.failed) {
  console.log('SBOM downloaded successfully')
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development

Install the required Node.js modules:

```sh
npm install
```

### Run CLI in Development Mode

Use the following command to run the CLI in development mode:

```sh
./bin/dev.js
```

Or to build an app:

```sh
./bin/dev.js build test/integration/testdata/nodejs_simple_app --container-runtime podman
```

### Run CLI in Production Mode

To run the CLI in production mode, you need to build the application first:

```sh
npm run build
```

Then, execute the CLI:

```sh
./bin/run.js
```

Note: You must rebuild every time you make changes to the source code.

### Testing

Run All Tests

```sh
npm run test
```

Run Unit Tests Only

```sh
npm run unit:test
```

Run Integration Tests Only

```sh
npm run integration:test
```

Run Tests in Debug Mode

For unit tests (useful for `.only` or extended execution time):

```sh
npm run unit:test:debug
```

For integration tests:

```sh
npm run integration:test:debug
```

Test Coverage

Run tests with coverage:

```sh
npm run test:coverage
```
