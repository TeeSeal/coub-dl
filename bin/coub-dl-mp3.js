#!/usr/bin/env node

const { version } = require('../package')
const { resolvePath } = require('../src/Util')
const Coub = require('../')
const { createWriteStream } = require('fs')
const { Readable } = require('stream')

// CLI Setup
const program = require('commander')
  .version(version)
  .option('-i, --input <input>', 'input (coub link or id)')
  .option('-o, --output <output>', 'output file location')

program.on('--help', () => {
  const examples = [
    '\n  Examples:\n',
    '    coub-dl-mp3 --input https://coub.com/view/135nqc --output out.mp3',
    '    coub-dl-mp3 -i https://coub.com/view/135nqc',
  ].join('\n')

  console.log(examples)
})

program.parse(process.argv)

// Main
async function run() {
  const { input, output } = program
  if (!input) {
    return console.log('Please specify input. Use --help to see the list of options.')
  }

  const coub = await Coub.fetch(input)
  const path = resolvePath(output, coub.metadata.title, 'mp3')

  const response = await fetch(coub.audioURL)
  Readable.from(response.body).pipe(createWriteStream(path))
}

run()
