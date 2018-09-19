#!/usr/bin/env node

const { version } = require('../package')
const { resolvePath } = require('../src/Util')
const axios = require('axios')
const { createWriteStream } = require('fs')

// CLI Setup
const program = require('commander')
  .version(version)
  .option('-i, --input <input>', 'input (coub link or id)')
  .option('-o, --output <output>', 'output file location')

program.on('--help', () => {
  const examples = [
    '\n  Examples:\n',
    '    coub-dl-mp3 --input https://coub.com/view/135nqc --output out.mp3',
    '    coub-dl -i https://coub.com/view/135nqc',
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
  const { data } = await axios.get(`http://coub.com/api/v2/coubs/${id}`).catch(() => ({}))
  if (!data) {
    return console.log(
      'Couldn\'t fetch your coub. Please check the url/id and try again.'
    )
  }

  const audioURLs = data.file_versions.html5.audio
  const url = audioURLs.high.url || audioURLs.med.url
  const path = resolvePath(output, data.title, 'mp3')

  const { data: mp3 } = await axios.get(url, { responseType: 'stream' })
  mp3.pipe(createWriteStream(path))
}

run()
