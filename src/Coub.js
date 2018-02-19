const FFmkek = require('ffmkek')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

class Coub extends FFmkek {
  constructor(video, audio, { width, height, duration }) {
    if (typeof videoStream === 'string') {
      throw new Error('Please use Coub.fetch() to create coubs from URLs.')
    }

    super(video)
    this.video = video
    this.audio = audio
    this.width = width
    this.height = height
    this.duration = duration
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
    const part = this.parts[0]
    const file = Coub.textToTemp(`file ${this.video}\n`.repeat(times))

    part
      .setName(file)
      .addOption('-f', 'concat')
      .addOption('-safe', '0')

    return this
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
    const videoPath = await Coub.streamToTemp(videoStream)
    return new Coub(videoPath, audioURL, {
      width,
      height,
      duration: metadata.duration
    })
  }

  static streamToTemp(readStream) {
    const filePath = path.join(__dirname, '../temp.mp4')
    const writeStream = fs.createWriteStream(filePath)
    readStream.pipe(writeStream)

    return new Promise(resolve => {
      writeStream.once('finish', () => resolve(filePath))
    })
  }

  static textToTemp(text) {
    const filePath = path.join(__dirname, '../temp.txt')
    fs.writeFileSync(filePath, text)
    return filePath
  }
}

module.exports = Coub
