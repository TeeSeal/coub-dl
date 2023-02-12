const FFmkek = require('ffmkek')
const TempFile = require('./TempFile')
const { sep } = require('path')
const { Readable } = require('stream')

class Coub extends FFmkek {
  constructor(video, audio, { width, height, metadata }) {
    super(video)
    this.video = video
    this.audio = audio
    this.width = width
    this.height = height
    this.metadata = metadata
    this.duration = metadata.duration
  }

  crop(crop) {
    if (typeof crop !== 'string') {
      const offset = this.width / 2 - this.height / 2
      crop = `${this.height}:${this.height}:${offset}:0`
    }

    this.addOption('-vf', `crop=${crop}`)
    return this
  }

  scale(params) {
    params = params.toString()
    const separator = params.includes('x') ? 'x' : ':'
    const [width, height] = params.split(separator)
    this.width = width
    if (height) this.height = height

    const filterString = [width, height]
      .map(num => (isNaN(num) ? '-2' : num))
      .join(separator)

    this.addOption('-vf', `scale=${filterString}`)
    return this
  }

  attachAudio() {
    return this.addInput(this.audio)
  }

  loop(times) {
    if (times < 2) return this

    const path = this.video.split(sep).join('/').replace(' ', '\\ ')
    const list = new TempFile(`file ${path}\n`.repeat(times), 'txt').writeSync()
    this.parts[0].remove()

    return this
      .addOption('-f', 'concat')
      .addOption('-safe', '0')
      .addInput(list.path)
  }

  static async fetch(url, quality) {
    if (!['high', 'med'].includes(quality)) quality = 'high'
    const id = url.split('/').slice(-1)[0]

    const response = await fetch(`http://coub.com/api/v2/coubs/${id}`)
    const metadata = await response.json()

    if (!response.ok) throw new Error(metadata.error || 'Encountered and error while fetching the Coub')

    const { video: videoURLs, audio: audioURLs } = metadata.file_versions.html5
    const [videoURL, audioURL] = [videoURLs, audioURLs].map(obj => (obj[quality] || obj.med).url)

    const [width, height] = metadata.dimensions[quality === 'high' ? 'big' : 'med']

    const videoStream = await fetch(videoURL).then(response => Readable.from(response.body))
    videoStream.once('data', buffer => (buffer[0] = buffer[1] = 0)) // Decode weird Coub encoding.
    const video = await new TempFile(videoStream, 'mp4').write()

    const audioStream = await fetch(audioURL).then(response => Readable.from(response.body))
    const audio = await new TempFile(audioStream, 'mp3').write()

    return new Coub(video.path, audio.path, {
      width,
      height,
      metadata
    })
  }
}

module.exports = Coub
