#!/usr/bin/env node

const Coub = require('../')
const { version } = require('../package')
const { resolvePath } = require('../src/Util')

// CLI Setup
const program = require('commander')
  .version(version)
  .option('-i, --input <input>', 'input (coub link or id)')
  .option('-o, --output <output>', 'output file location')
  .option(
    '-c, --crop [crop]',
    'crop the output (width:height:x_offset:y_offset)'
  )
  .option('-s, --scale <size>', 'resize the output (widthxheight)')
  .option('-A, --no-audio', 'prevent addition of audio to the output')
  .option('-l, --loop <times>', 'loop the coub X times')
  .option(
    '-t, --time <amount>',
    'set the maximal amount of seconds for the length of the output'
  )
  .option(
    '-d, --details',
    'use in order to view the logs from ffmpeg while it works'
  )
  .option('-f, --format <format>', 'output file format (mp4, gif etc.)')

program.on('--help', () => {
  const examples = [
    '\n  Examples:\n',
    '    coub-dl --input https://coub.com/view/135nqc --no-audio --output out.mp4',
    '    coub-dl -i https://coub.com/view/135nqc -o out.gif --crop --scale 250',
    '    coub-dl -i https://coub.com/view/135nqc -o out.mp4 --loop 3',
    '    coub-dl -i https://coub.com/view/135nqc -o out.mp4 --loop 10 --time 12'
  ].join('\n')

  console.log(examples)
})

program.parse(process.argv)

// Main
async function run() {
  const { input, output, loop, audio, crop, scale, time, details, format } = program
  if (!input) {
    return console.log('Please specify input. Use --help to see the list of options.')
  }

  const coub = await Coub.fetch(input)

  if (audio) coub.attachAudio()
  await coub.downloadSources() // speeds things up

  if (loop) coub.loop(loop)
  if (crop) coub.crop(crop)
  if (scale) coub.scale(scale)
  if (time) coub.addOption('-t', time)
  if (details) coub.on('info', console.log)
  if (!crop && !scale) coub.addOption('-c:v:0', 'copy')
  coub.addOption('-shortest')

  const path = resolvePath(output, coub.metadata.title, format)
  return coub.write(path)
}

run()
