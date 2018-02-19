const { EventEmitter } = require('events')
const { spawn } = require('child_process')
const { Stream, PassThrough }= require('stream')

class FFmpeg extends EventEmitter {
  constructor(source) {
    super()
    this.args = []
    this.inStream = null
    this.output = null

    this.videoFilters = []
    if (source) this.in(source)
  }

  opt(key, value) {
    this.args.push(...[key, value].filter(t => t))
    return this
  }

  opts(opts) {
    for (const [key, value] of opts) {
      this.opt(key, value)
    }
    return this
  }

  in(source) {
    this.applyFilters()
    if (FFmpeg.isReadStream(source)) {
      if (this.inStream) throw new Error('only one input stream is supported')
      this.opt('-i', 'pipe:0')
      this.inStream = source
    } else {
      this.opt('-i', source)
    }
    return this
  }

  out(destination) {
    this.output = destination
    return this
  }

  vf(filter) {
    this.videoFilters.push(filter)
  }

  applyFilters() {
    if (this.videoFilters.length) {
      this.opt('-vf', this.videoFilters.join(','))
      this.videoFilters = []
    }
  }

  run() {
    if (!this.output) this.output = new PassThrough()
    const toStream = !(typeof this.output === 'string')
    const outArg = toStream ? 'pipe:1' : this.output

    this.applyFilters()
    const proc = spawn('ffmpeg', this.args.concat([outArg, '-y']))
    if (this.inStream) this.inStream.pipe(proc.stdin)
    if (toStream) proc.stdout.pipe(this.output)

    proc.stderr.on('data', data => this.emit('info', data.toString()))

    return new Promise(resolve => {
      proc.stderr.once('end', () => resolve(this.output))
    })
  }

  write(destination) {
    this.out(destination)
    return this.run()
  }

  static isReadStream(obj) {
    return (
      obj instanceof Stream &&
      typeof obj._read === 'function' &&
      typeof obj._readableState === 'object'
    )
  }
}

module.exports = FFmpeg
