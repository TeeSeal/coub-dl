#!/usr/bin/env node

const Coub = require('../')
const { version } = require('../package')
const { resolvePath, downloadCoub } = require('../src/Util')

// CLI Setup
const program = require('commander')
  .version(version)
  .option('-i, --input <input>', 'input (channel link or identifier)')
  .option('-o, --output <output>', 'output directory')
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
  .option(
    '--group <amount>',
    'number of coubs to download at once'
  )
  .option(
    '--delay [seconds]',
    'amount of secounds to wait between downloading groups of coubs. Defaults to 3.',
    '3'
  )
  .option('--limit <amount>', 'maximum amount of coubs to download')

program.on('--help', () => {
  const examples = [
    '\n  Examples:\n',
    '    coub-dl-channel --input https://coub.com/past.memories --no-audio --output ./past.memories',
    '    coub-dl-channel -i https://coub.com/past.memories -o ./past_memories --crop --scale 250',
    '    coub-dl-channel -i https://coub.com/past.memories -o ./past_memories --loop 3',
    '    coub-dl-channel -i https://coub.com/past.memories -o ./past_memories --loop 10 --time 12',
    '    coub-dl-channel -i https://coub.com/past.memories -o ./past_memories --group 10 --delay 5',
    '\n  Notes:\n',
    '    Provided options will be applied to all coubs on the channel feed.',
    '    Depending on the amount of coubs, this may be a very lengthy process.'
  ].join('\n')

  console.log(examples)
})

program.parse(process.argv)

// Main
async function run() {
  const { input, output, format, group, delay, limit } = program
  if (!input) {
    return console.log('Please specify input. Use --help to see the list of options.')
  }

  const channelPermalink = input.split('/').slice(-1)[0]
  let page = 1
  const url = new URL(`https://coub.com/api/v2/timeline/channel/${channelPermalink}`)
  url.searchParams.set('page', 1)
  url.searchParams.set('per_page', 25)

  let dynamicLimit = parseInt(limit) || Infinity

  for (;;) {
    const response = await fetch(url)
    const responseJSON = await response.json()

    if (!response.ok)
      throw new Error(responseJSON.error || 'Encountered and error while fetching channel data')

    const coubs = responseJSON.coubs.slice(0, dynamicLimit)
    const groups = groupArray(coubs, group)

    for (const group of groups) {
      group.forEach(async metadata => {
        const coub = new Coub(metadata)
        const path = resolvePath(output, `[${coub.metadata.permalink}] ${coub.metadata.title}`, format, true)
        console.log(`Downloading ${coub.url} to ${path}`)
        downloadCoub(coub, path, program)
      })

      await sleep(delay)
    }

    dynamicLimit -= coubs.length
    if (dynamicLimit <= 0) break

    if (page === responseJSON.total_pages) break
    page += 1
    url.searchParams.set('page', page)
  }
}

function groupArray(array, chunkSize) {
  if (!chunkSize) return [array]

  chunkSize = parseInt(chunkSize)
  array = [...array]
  const result = []

  while (array.length) {
    result.push(array.splice(0, chunkSize))
  }

  return result
}

function sleep(seconds) {
  seconds = parseInt(seconds)
  return new Promise(reslove => setTimeout(reslove, seconds * 1000))
}

run()
