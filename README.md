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

## CLI Usage (Video)

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
-d, --details          use in order to view the logs from ffmpeg while it works
-C, --copy-codec       copy the codecs from the input. Improves speed but might cause issues with sound in some players
-h, --help             output usage information
-f, --format           output file format (mp4, gif etc.)
```

**NOTE:** About the `-C` option. Originally codecs were copied by default as it improved the speed of the process, but it was reported
that some players fail to detect the sound of the output file when doing so, as such, the codec copying is now an option.

* If you DO use the `-C` option:
  some players will have issues with the sound of the output BUT the process will be faster!
  Use this if you don't really care about sound, or your player (or whatever else uses your output) supports the codecs for sound.

* If you DON'T use the `-C` option:
  all players will be able to play your file just fine, but the process will take longer as ffmpeg will have to decode and reencode your file.

The `--copy-codec` option will only work if you don't use any other video filters such as `crop` and `scale`.
If you do, adding this option will have no effect. (FFmpeg will still have to decode and encode the video)

Examples:

```sh
# Download coub without audio
$ coub-dl --input https://coub.com/view/135nqc --output out.mp4 --no-audio -C
# Download coub as gif, crop it as a square and scale it down to 250x250
$ coub-dl -i https://coub.com/view/135nqc -o out.gif --crop --scale 250
# Download coub and loop it 3 times
$ coub-dl -i https://coub.com/view/135nqc -o out.mp4 --loop 3 -C
# Download coub and make sure it's no longer than 12 seconds
$ coub-dl -i https://coub.com/view/135nqc -o out.mp4 --loop 10 --time 12 -C
```

### Resolving the output file path

coub-dl will try to resolve the output file path automatically if you don't specify it.
By default, the coub title will be used as the file name. Here are some examples.

The coub title is `Dance`.
Let the current directory be `/home/coubs`.

```sh
$ coub-dl -i https://coub.com/view/135nqc
# produces /home/coubs/Dance.mp4

$ coub-dl -i https://coub.com/view/135nqc --format gif
# produces /home/coubs/Dance.gif
```

If you do want to use a custom path but also include the coub title, you can use the `:name:` special
pattern in the path which will be replaced with the coub title.

```sh
$ coub-dl -i https://coub.com/view/135nqc -o /my/custom/directory/:name:.gif
# produces /my/custom/directory/Dance.gif
```

You may also omit the file extension, which will default to `mp4`.

```sh
$ coub-dl -i https://coub.com/view/135nqc -o /my/custom/directory/:name:
# produces /my/custom/directory/Dance.mp4
```

**NOTE:** If you do specify a file extension in the path, the `--format` option will be ignored.
For example:

```sh
$ coub-dl -i https://coub.com/view/135nqc -o /my/custom/directory/:name:.mp4 -f gif
# produces /my/custom/directory/Dance.mp4
```

## CLI Usage (Audio)

This is an utility that lets you download the audio from coubs separately.

List options and examples:

```sh
$ coub-dl-mp3 --help
```

Available options:

```
-V, --version          output the version number
-i, --input <input>    input (coub link or id)
-o, --output <output>  output file location
-h, --help             output usage information
```

Examples:

```sh
$ coub-dl-mp3 -i https://coub.com/view/135nqc -o out.mp3
$ coub-dl-mp3 -i https://coub.com/view/135nqc
```

The output file path resolves the same way as with the video CLI, except the format defaults to `mp3`.

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

### Coub.prototype.loop(times)

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
