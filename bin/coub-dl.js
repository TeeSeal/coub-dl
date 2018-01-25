#!/usr/bin/env node
const fetchCoub = require('../')
const ffmpeg = require('fluent-ffmpeg')
const { PassThrough } = require('stream')

const program = require('commander')
  .option('-i, --input [input]', 'Input (coub link or id)')
  .option('-o, --output [output]', 'Output file location')
  .option(
    '-c, --crop [crop]',
    'Crop the output (width:height:x_offset:y_offset)'
  )
  .option('-s, --size [size]', 'Resize the output (widthxheight)')
  .option('-a, --aspect [ratio]', 'Set aspect ratio (w:h)')
  .parse(process.argv)

// ---- MAIN ----
async function run() {
  const { input, output } = program
  if (!input || !output) {
    return console.log(
      'Please specify both input and output. Use --help to see the list of options.'
    )
  }

  const coub = await fetchCoub(input)
  if (!coub) {
    return console.log(
      "Couldn't fetch your coub. Please check the url/id and try again."
    )
  }

  ffmpegStream = ffmpeg(bufferToStream(coub))

  // CROP
  if (program.crop) {
    let { crop } = program
    if (typeof crop !== 'string') {
      const { width, height } = await getDimensions(coub)
      const offset = width / 2 - height / 2
      crop = `${height}:${height}:${offset}:0`
    }
    ffmpegStream.videoFilter(`crop=${crop}`)
  }

  // RESIZE
  if (program.size) {
    const [width, height] = program.size.split('x')
    ffmpegStream.size(`${width || '?'}x${height || '?'}`)
  }

  // ASPECT RATIO
  if (program.aspect) ffmpegStream.aspect(program.aspect)

  return ffmpegStream.save(output)
}

// ---- Helpers ----
function bufferToStream(buffer) {
  const stream = new PassThrough()
  stream.end(buffer)
  return stream
}

function getDimensions(buffer) {
  return new Promise((resolve, reject) => {
    ffmpeg(bufferToStream(buffer)).ffprobe(0, (err, data) => {
      if (err) return reject(err)
      const { width, height } = data.streams[0]
      resolve({ width, height })
    })
  })
}

run()
