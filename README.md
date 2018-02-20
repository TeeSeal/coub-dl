# coub-dl

A Coub downloader (CLI).

## Installation

As local package:

```sh
$ npm i coub-dl
```

As CLI:

```sh
$ npm i -g coub-dl
```

## Requirements

* FFmpeg (see [FFmpeg instalation](https://github.com/adaptlearning/adapt_authoring/wiki/Installing-FFmpeg))

## CLI Usage

List options and examples

```sh
$ coub-dl --help
```

Available options:
```
-V, --version          output the version number
-i, --input <input>    input (coub link or id)
-o, --output <output>  output file location
-c, --crop [crop]      crop the output (width:height:x_offset:y_offset)
-s, --scale <size>     resize the output (widthxheight)
-A, --no-audio         prevent addition of audio to the output
-l, --loop <times>     loop the coub X times
-t, --time <amount>    set the maximal amount of seconds for the length of the output
-i, --info             use in order to view the logs from ffmpeg while it works
-h, --help             output usage information
```

Examples:

```sh
# Download coub without audio
$ coub-dl --input https://coub.com/view/135nqc --output out.mp4 --no-audio
# Download coub as gif, crop it as a square and scale it down to 250x250
$ coub-dl -i https://coub.com/view/135nqc -o out.gif --crop --scale 250
# Download coub and loop it 3 times
$ coub-dl -i https://coub.com/view/135nqc -o out.mp4 --loop 3
# Download coub and make sure it's no longer than 12 seconds
$ coub-dl -i https://coub.com/view/135nqc -o out.mp4 --loop 10 --time 12
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

Attaches the Coub audio to the output.
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

The `write()` method is inherited from [FFmkek](https://github.com/TeeSeal/ffmkek).

```js
coub.write('my/coub/dir/thing.mp4')
// => Promise<string>

coub.write()
// => Promise<Stream>
```

## Contributing

This is a very early build.
If you have any suggestions feel free to file an issue, or if you've already implemented changes PR's are also welcome.
