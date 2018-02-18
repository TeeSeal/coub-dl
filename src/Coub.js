const axios = require('axios')
const Ffmpeg = require('fluent-ffmpeg')
const { PassThrough } = require('stream')

class Coub extends Ffmpeg {
  constructor(videoStream, audio, { width, height }) {
    if (typeof videoStream === 'string') {
      throw new Error('Please use Coub.fetch() to create coubs from URLs.')
    }

    super(videoStream)
    this.audio = audio
    this.width = width
    this.height = height
  }

  crop(crop) {
    if (typeof crop !== 'string') {
      const offset = this.width / 2 - this.height / 2
      crop = `${this.height}:${this.height}:${offset}:0`
    }

    this.videoFilter(`crop=${crop}`)
    return this
  }

  size(params) {
    const [width, height] = params.split(/x|:/)
    this.width = width
    if (height) this.height = height

    super.size(`${width}x${height || '?'}`)
    return this
  }

  attachAudio() {
    return this
      .input(this.audio)
      .addOption('-shortest')
  }

  static async fetch(url, quality) {
    if (!['high', 'med'].includes(quality)) quality = 'high'
    const id = url.split('/').slice(-1)[0]

    const { data: metadata } = await axios
      .get(`http://coub.com/api/v2/coubs/${id}`)
    if (!metadata) return null

    const {
      video: {
        [quality]: { url: videoURL }
      },
      audio: {
        [quality]: { url: audioURL }
      }
    } = metadata.file_versions.html5

    const [width, height] = metadata.dimensions[
      quality === 'high' ? 'big' : 'med'
    ]

    const { data: videoBuffer } = await axios.get(videoURL, {
      responseType: 'arraybuffer'
    })
    videoBuffer[0] = videoBuffer[1] = 0

    const videoStream = new PassThrough()
    videoStream.end(videoBuffer)

    return new Coub(videoStream, audioURL, { width, height })
  }
}

module.exports = Coub
