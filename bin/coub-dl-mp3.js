#!/usr/bin/env node

const { version } = require('../package')
const { resolvePath } = require('../src/Util')
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

  const id = input.split('/').slice(-1)[0]
  const response = await fetch(`http://coub.com/api/v2/coubs/${id}`)
  const data = await response.json()

  if (!response.ok) throw new Error(data.error || 'Encountered and error while fetching the Coub')

  const audioURLs = data.file_versions.html5.audio
  const url = audioURLs.high.url || audioURLs.med.url
  const path = resolvePath(output, data.title, 'mp3')

  const mp3 = await fetch(url).then(response => Readable.from(response.body))
  mp3.pipe(createWriteStream(path))
}

run()
