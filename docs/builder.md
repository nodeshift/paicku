`paicku builder`
================

Display suggested builders for the given application

* [`paicku builder suggest`](#paicku-builder-suggest)

## `paicku builder suggest`

Display suggested builders for the given application

```
USAGE
  $ paicku builder suggest [--force-color] [--no-color] [-q] [--timestamps] [-v] [-h]

FLAGS
  -h, --help  Help for 'builder suggest'

GLOBAL FLAGS
  -q, --quiet        Show less output
  -v, --verbose      Show more output
      --force-color  Force color output
      --no-color     Disable color output
      --timestamps   Enable timestamps in output

DESCRIPTION
  Display suggested builders for the given application

ALIASES
  $ paicku builder suggest
  $ paicku builders suggest

EXAMPLES
  $ paicku builder suggest
```

_See code: [src/commands/builder/suggest.ts](https://github.com/nodeshift/paicku/blob/v0.0.7/src/commands/builder/suggest.ts)_
