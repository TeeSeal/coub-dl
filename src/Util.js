const { extname } = require('path')

class Util {
  constructor() {
    throw new Error(`the ${this.constructor.name} may not be initialized.`)
  }

  static resolvePath(path = '', name, ext = 'mp4') {
    if (!path) path = name
    path = path.replace(/:name:/g, name)
    if (!extname(path)) path += `.${ext}`
    return path
  }
}

module.exports = Util
