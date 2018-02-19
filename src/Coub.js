const axios = require('axios')
const FFmpeg = require('./FFmpeg')

class Coub extends FFmpeg {
  constructor(video, audio, { width, height }) {
    if (typeof videoStream === 'string') {
      throw new Error('Please use Coub.fetch() to create coubs from URLs.')
    }

    super(video)
    this.video = video
    this.audio = audio
    this.width = width
    this.height = height
  }

  crop(crop) {
    if (typeof crop !== 'string') {
      const offset = this.width / 2 - this.height / 2
      crop = `${this.height}:${this.height}:${offset}:0`
    }

    this.vf(`crop=${crop}`)
    return this
  }

  scale(params) {
    params = params.toString()
    const separator = params.includes('x') ? 'x' : ':'
    const [width, height] = params.split(separator)
    this.width = width
    if (height) this.height = height

    this.vf(
      `scale=${[width, height]
        .map(num => (isNaN(num) ? '-1' : num))
        .join(separator)}`
    )
    return this
  }

  attachAudio() {
    return this.in(this.audio).opt('-shortest')
  }

  static async fetch(url, quality) {
    if (!['high', 'med'].includes(quality)) quality = 'high'
    const id = url.split('/').slice(-1)[0]

    const { data: metadata } = await axios.get(
      `http://coub.com/api/v2/coubs/${id}`
    )
    if (!metadata) return null

    const {
      video: { [quality]: { url: videoURL } },
      audio: { [quality]: { url: audioURL } }
    } = metadata.file_versions.html5

    const [width, height] = metadata.dimensions[
      quality === 'high' ? 'big' : 'med'
    ]

    const { data: videoStream } = await axios.get(videoURL, {
      responseType: 'stream'
    })

    // Decode weird Coub encoding.
    videoStream.once('data', buffer => (buffer[0] = buffer[1] = 0))
    return new Coub(videoStream, audioURL, { width, height })
  }
}

module.exports = Coub
