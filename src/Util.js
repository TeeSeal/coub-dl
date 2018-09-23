const { extname } = require('path')

class Util {
  constructor() {
    throw new Error(`the ${this.constructor.name} may not be initialized.`)
  }

  static resolvePath(path = '', name, ext = 'mp4') {
    if (Util.illegalPathCharacters.test(name)) {
      name = name.replace(Util.illegalPathCharacters, '')
      console.log('Warning: some illegal characters have been removed from the name.')
    }

    if (!path) path = name
    path = path.replace(/:name:/g, name)
    if (!extname(path)) path += `.${ext}`

    return path
  }

  static get illegalPathCharacters() {
    return /[/\\?%*:|"<>]/g
  }
}

module.exports = Util
