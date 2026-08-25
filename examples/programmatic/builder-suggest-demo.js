import {createPaicku} from '../../dist/index.js'

const paicku = createPaicku()

console.log('Running builder suggest command...')
console.log('--------------------------------')

const result = await paicku.builder.suggest({
  verbose: false,
})

console.log(result.stdout)
console.log('--------------------------------')
console.log('Command executed:', result.command)
