const FFmkek = require('ffmkek')
const axios = require('axios')
const TempFile = require('./TempFile')
const { Stream } = require('stream')

class Coub extends FFmkek {
  constructor(video, audio, { width, height, duration }) {
    super(video)
    this.video = video
    this.audio = audio
    this.width = width
    this.height = height
    this.duration = duration

    this.tempFiles = []
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

  async loop(times) {
    if (times < 2) return
    const videoFile = this.video instanceof Stream
      ? await new TempFile(this.video, 'mp4').write()
      : this.video

    const list = await new TempFile(`file ${videoFile}\n`.repeat(times), 'txt').write()
    this.parts[0].remove()
    this.tempFiles.push(list, videoFile)
    return this
      .addOption('-f', 'concat')
      .addOption('-safe', '0')
      .addInput(list.path)
  }

  async run() {
    const result = await super.run()
    this.tempFiles.forEach(file => file.delete())
    return result
  }

  static async fetch(url, quality) {
    if (!['high', 'med'].includes(quality)) quality = 'high'
    const id = url.split('/').slice(-1)[0]

    const { data: metadata } = await axios.get(
      `http://coub.com/api/v2/coubs/${id}`
    )
    if (!metadata) return null

    const { video: videoURLs, audio: audioURLs } = metadata.file_versions.html5
    const [videoURL, audioURL] = [videoURLs, audioURLs].map(
      obj => (obj[quality] || obj.med).url
    )

    const [width, height] = metadata.dimensions[
      quality === 'high' ? 'big' : 'med'
    ]

    const { data: videoStream } = await axios.get(videoURL, {
      responseType: 'stream'
    })

    // Decode weird Coub encoding.
    videoStream.once('data', buffer => (buffer[0] = buffer[1] = 0))
    return new Coub(videoStream, audioURL, {
      width,
      height,
      duration: metadata.duration
    })
  }
}

module.exports = Coub
