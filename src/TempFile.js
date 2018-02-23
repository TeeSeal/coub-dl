const fs = require('fs')
const path = require('path')
const { Stream } = require('stream')

const TEMP_DIR_PATH = path.join(__dirname, '..', 'temp')
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

class TempFile {
  constructor(content, extension) {
    this.content = content
    this.path = TempFile.generatePath(extension)

    if (!fs.existsSync(TEMP_DIR_PATH)) fs.mkdirSync(TEMP_DIR_PATH)
  }

  write() {
    return this.content instanceof Stream
      ? this._writeStream()
      : this._writeFile()
  }

  delete() {
    return new Promise((resolve, reject) => {
      fs.unlink(this.path, err => {
        if (err) return reject(err)
        return resolve()
      })
    })
  }

  toString() {
    return this.path
  }

  _writeStream() {
    const stream = fs.createWriteStream(this.path)
    this.content.pipe(stream)

    return new Promise((resolve, reject) => {
      stream.once('error', reject)
      stream.once('finish', () => resolve(this))
    })
  }

  _writeFile() {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.path, this.content, err => {
        if (err) return reject(err)
        return resolve(this)
      })
    })
  }

  static generatePath(ext) {
    const file = path.join(TEMP_DIR_PATH, `${TempFile.generateId()}.${ext}`)
    if (fs.existsSync(file)) return this.generatePath()
    return file
  }

  static generateId() {
    return Array
      .from({ length: 5 }, () => CHARS[Math.floor(Math.random() * CHARS.length)])
      .join('')
  }
}

module.exports = TempFile
