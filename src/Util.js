const { extname, join } = require('path')

class Util {
  constructor() {
    throw new Error(`the ${this.constructor.name} may not be initialized.`)
  }

  static resolvePath(path = '', name, ext = 'mp4', isDirectory = false) {
    if (Util.illegalPathCharacters.test(name)) {
      name = name.replace(Util.illegalPathCharacters, '')
    }

    const nameExt = `${name}.${ext}`

    if (isDirectory) {
      path = join(path || '', nameExt)
    } else if (path) {
      path = path.replace(/:name:/g, name)
      if (!extname(path)) path += `.${ext}`
    } else {
      path = nameExt
    }

    return path
  }

  static async downloadCoub(coub, targetPath, options = {}) {
    const { loop, audio, crop, scale, time, details } = options

    if (audio) coub.attachAudio()
    await coub.downloadSources() // speeds things up

    if (loop) coub.loop(loop)
    if (crop) coub.crop(crop)
    if (scale) coub.scale(scale)
    if (time) coub.addOption('-t', time)
    if (details) coub.on('info', console.log)
    if (!crop && !scale) coub.addOption('-c:v:0', 'copy')
    coub.addOption('-shortest')

    coub.write(targetPath)
  }

  static get illegalPathCharacters() {
    return /[/\\?%*:|"<>]/g
  }
}

module.exports = Util
