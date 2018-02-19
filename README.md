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

* FFmpeg (see [FFmpeg instalation](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg))

## CLI Usage

List options and examples

```
$ coub-dl --help
```

Examples:

```
$ coub-dl --input https://coub.com/view/135nqc --output --no-audio out.mp4
$ coub-dl --input https://coub.com/view/135nqc --output out.gif --crop --scale 250
$ coub-dl -i https://coub.com/view/135nqc -o out.mp4
```

## Documentation

### Coub

Extends [FFmkek](https://github.com/TeeSeal/ffmkek).
```js
const Coub = require('coub-dl')
```

### Coub.fetch(url[, quality])

Takes a coub URL (or just ID), fetches it and returns a Coub instance.
Optionally takes a quality argument. Can only be `high` or `med`.

```js
const coub = await Coub.fetch('http://coub.com/view/w6uc9')
// => Promise<Coub>
```

### Coub.prototype.crop([data])

Takes an argument similar to the [FFmpeg crop filter](http://www.bugcodemaster.com/article/crop-video-using-ffmpeg) except it is optional.
If no data is provided the output is cropped as a centered square.

```js
coub.crop() // Crops centered square
coub.crop('500:200:0:0') // Crop 500x200 with no offset from top right
// => Coub
```

### Coub.prototype.scale(data)

Scale the output video.

```js
coub.scale(250) // Scale the video to 250 pixel width while preserving aspect ratio
coub.scale('-2:100') // Scale the video to 100 pixel height while preserving aspect ratio
coub.scale('250:100') // Scale the video to 250x100
// => Coub
```

### Coub.prototype.attachAudio()

Attaches the Coub audio to the output. Audio is automatically cropped to the duration of the coub.
NOTE: Do this before applying any other filters. Unless you want to apply the filters to the audio.

```js
coub.attachAudio()
// => Coub
```

### Coub.prototype.loop()

Loop the video a given amount of times. If the video ends up longer than the audio, it is shortened to the length of the audio.

```js
coub.loop(3)
// => Coub
```

### Writing the output

```js
coub.write('my/coub/dir/thing.mp4')
```

## Contributing

This is a very early build.
If you have any suggestions feel free to file an issue, or if you've already implemented changes PR's are also welcome.
