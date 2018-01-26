const axios = require('axios')
const Ffmpeg = require('fluent-ffmpeg')
const { PassThrough } = require('stream')

class Coub extends Ffmpeg {
  constructor(stream, { width, height }) {
    super(stream)
    if (typeof stream === 'string') {
      throw new Error('Please use Coub.fetch() to create coubs from URLs.')
    }

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

  static async fetch(url, quality) {
    if (!['high', 'med'].includes(quality)) quality = 'high'
    const id = url.split('/').slice(-1)[0]

    const { data: metadata } = await axios
      .get(`http://coub.com/api/v2/coubs/${id}`)
      .catch(() => null)
    if (!metadata) return null

    const mp4 = metadata.file_versions.html5.video[quality].url
    const [width, height] = metadata.dimensions[
      quality === 'high' ? 'big' : 'med'
    ]

    const { data: buffer } = await axios.get(mp4, {
      responseType: 'arraybuffer'
    })
    buffer[0] = buffer[1] = 0

    const stream = new PassThrough()
    stream.end(buffer)

    return new Coub(stream, { width, height })
  }
}

module.exports = Coub
