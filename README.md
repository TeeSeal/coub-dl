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
-h, --help             output usage information
-f, --format           output file format (mp4, gif etc.)
```

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

### Downloading coub for full length of audio

There is currently no explicit way of achieving this but you can do it through a sort of a "hack":

```sh
$ coub-dl -i https://coub.com/view/135nqc -o out.mp4 --loop 999
```

While looping the coub 999 times might sound scary, the script actually checks which part of the media
(the audio or the video) is shorter, and crops it down to the shorter one. So if the video is
a couple hours long and the audio is only 3 minutes long, the resulting file will be cropped down to 3 minutes.

It also works the other way around. If the audio is 3 minutes and the video is 15 seconds, the output is cropped
to 15 seconds.

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
