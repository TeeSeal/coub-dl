const temp = require('tempy')
const fs = require('fs')
const { Stream } = require('stream')

class TempFile {
  constructor(content, extension) {
    this.content = content
    this.path = temp.file({ extension })
  }

  write() {
    return this.content instanceof Stream
      ? this._writeStream()
      : this._writeFile()
  }

  writeSync() {
    fs.writeFileSync(this.path, this.content)
    return this
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
}

module.exports = TempFile
