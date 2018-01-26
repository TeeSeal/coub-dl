# coub-dl

A Coub downloader (CLI).

## Installation

As local package:

```
$ npm i coub-dl
```

As CLI:

```
$ npm i -g coub-dl
```

## Requirements

* ffmpeg (see [ffmpeg instalation](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg))

## CLI Usage

List options and examples

```
$ coub-dl --help
```

Examples:

```
$ coub-dl --input http://coub.com/view/w6uc9 --output out.mp4
$ coub-dl --input http://coub.com/view/w6uc9 --output out.gif --crop --size 250 --aspect 4:3'
```

## Documentation

### Coub

```js
const Coub = require('coub-dl')
```

The Coub class extends the [FfmpegCommand](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg).
Any methods available on that are also available on instances of the Coub class.

---

### Coub.fetch(url[, quality])

Takes a coub URL (or just ID), fetches it and returns a Coub instance.
Optionally takes a quality argument. Can only be `high` or `med`.

```js
const coub = Coub.fetch('http://coub.com/view/w6uc9')
// => Promise<Coub>
```

---

### Coub.prototype.crop([data])

Takes an argument similar to the [FFMPEG crop filter](http://www.bugcodemaster.com/article/crop-video-using-ffmpeg) except it is optional.
If no data is provided the output is cropped as a centered square.

```js
coub.crop() // Crops centered square
coub.crop('500:200:0:0') // Crop 500x200 with no offset from top right
// => Coub
```

Returns: Coub

---

### Coub.prototype.size(data)

Similar to `FfmpegCommand.prototype.size()` but with less strict syntax.

```js
coub.size(250) // Scale the video to 250 pixel width while preserving aspect ratio
coub.size('?x100') // Scale the video to 100 pixel height while preserving aspect ratio
coub.size('250x100') // Scale the video to 250x100
// => Coub
```

---

### Writing the output

```js
coub.save('my/coub/dir/thing.mp4')
```

## Contributing

This is a very early build.
If you have any suggestions feel free to file an issue, or if you've already implemented changes PR's are also welcome.
