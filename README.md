# paicku

Paicku is a wrapper of [pack CLI](https://github.com/buildpacks/pack) for containerizing applications using buildpacks, in a little bit easier way.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/paicku.svg)](https://npmjs.org/package/paicku)
[![Downloads/week](https://img.shields.io/npm/dw/paicku.svg)](https://npmjs.org/package/paicku)

# Usage

```sh-session
$ npm install -g paicku
```

Go to your application directory

```
cd ./my-node-app-dir
```

```
$ paicku build
```

You can also use npx

```sh-session
$ npx paicku build
```

The above commands will output an container image to your registry with a random name.

If you want to specify a name, you can do

```sh-session
$ npx paicku build my-image-name
```

or if you want to specify a path

```sh-session
 npx paicku build my-image-name --path /path/to/my/app/dir
```

Paicku supports all the essentail commands that a developer might need. For more information do

```sh-session
$ npx paicku --help
```

# Available commands

<!-- commands -->

# Command Topics

- [`paicku build`](docs/build.md) - Build an image
- [`paicku builder`](docs/builder.md) - Interact with builders
- [`paicku help`](docs/help.md) - Display help for paicku.
- [`paicku inspect`](docs/inspect.md) - Show information about a built app image
- [`paicku sbom`](docs/sbom.md) - Interact with SBoM

<!-- commandsstop -->

# Examples

## build an app using podman

```
npx paicku build . --container-runtime podman
```

## Development

Install the required Node.js modules

```
npm i
```

### Run CLI in development mode:

Use the following command to run the CLI in development mode:

```
./bin/dev.js
```

or to build an app

```
./bin/dev.js build test/integration/testdata/nodejs_simple_app --container-runtime podman
```

### Run CLI in production mode:

To run the CLI in production mode, you need to build the application first. Run the build command:

```
npm run build
```

Then, execute the CLI:

```
./bin/run.js
```

Note: You must rebuild every time you make changes to the source code

### Tests

To run all the tests:

```
npm run test
```

To run only the unit tests:

```
npm run unit:test
```

To run only the integration tests:

```
npm run integration:test
```

To run unit tests in debug mode (e.g., for using .only or extended execution time):

```
npm run unit:test:debug
```

To run integration tests in debug mode:

```
npm run integration:test:debug
```

For more info, refer to the [OCLI documentation](https://oclif.io/docs/introduction)
