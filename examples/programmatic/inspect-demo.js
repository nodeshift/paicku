import {createPaicku} from '../../dist/index.js'

const paicku = createPaicku({})

const result = await paicku.inspect('yarn-simple-app:latest', {
  output: 'json',
})

console.log('--------------------------------')
console.log(result.stdout)
console.log('--------------------------------')
