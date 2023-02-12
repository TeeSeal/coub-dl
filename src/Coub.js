const FFmkek = require('ffmkek')
const TempFile = require('./TempFile')
const { sep } = require('path')
const { Readable } = require('stream')

class Coub extends FFmkek {
  constructor(metadata) {
    super()

    this.metadata = metadata
    this.duration = metadata.duration
    this.urls = metadata.file_versions.html5
    ;[this.width, this.height] = metadata.dimensions['big']

    this.videoURL = this.videoInput = this.urls.video.high.url || this.urls.video.med.url
    this.audioURL = this.audioInput = this.urls.audio.high.url || this.urls.audio.med.url

    this.videoPart = this.currentPart
    this.audioPart = null

    this.addInput(this.videoInput)
  }

  get url() {
    return `https://coub.com/view/${this.metadata.permalink}`
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
    this.audioPart = this.currentPart
    return this.addInput(this.audioInput)
  }

  loop(times) {
    if (times < 2) return this

    const path = this.videoInput.split(sep).join('/').replace(' ', '\\ ')
    const list = new TempFile(`file ${path}\n`.repeat(times), 'txt').writeSync()

    this.videoPart
      .setName(list.path)
      .addOption('-f', 'concat')
      .addOption('-safe', '0')

    return this
  }

  downloadSources() {
    const promises = [this.downloadVideo()]
    if (this.audioPart) promises.push(this.downloadAudio())
    return Promise.all(promises)
  }

  async downloadVideo() {
    if (!this.videoInput.startsWith('http')) return

    const videoStream = await fetch(this.videoURL).then(response => Readable.from(response.body))
    videoStream.once('data', buffer => (buffer[0] = buffer[1] = 0)) // Decode weird Coub encoding.
    const video = await new TempFile(videoStream, 'mp4').write()

    this.videoInput = this.videoPart.name = video.path
  }

  async downloadAudio() {
    const audioStream = await fetch(this.audioURL).then(response => Readable.from(response.body))
    const audio = await new TempFile(audioStream, 'mp3').write()

    this.audioInput = this.audioPart.name = audio.path
  }

  static async fetch(url) {
    const id = url.split('/').slice(-1)[0]
    const response = await fetch(`http://coub.com/api/v2/coubs/${id}`)

    // Check if coub was moved
    if (response.status == 404) {
      const webURL = `https://coub.com/view/${id}`
      const webResponse = await fetch(webURL)
      if (webResponse.url !== webURL) return Coub.fetch(webResponse.url)
    }

    const metadata = await response.json()

    if (!response.ok)
      throw new Error(metadata.error || 'Encountered and error while fetching the Coub')

    return new Coub(metadata)
  }
}

module.exports = Coub
