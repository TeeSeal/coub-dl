# coub-dl

A Coub downloading CLI.

```
$ npm i -g coub-dl
```

In order to see all options use:

```
$ coub-dl --help
```

## Usage

Simplest example:

```
$ coub-dl -i <LINK|ID> -o out.mp4
```

The output is piped through ffmpeg so you can use multiple formats:

```
$ coub-dl -i <LINK|ID> -o out.gif
```

### CROP

By default crops a centered square

```
$ coub-dl -i <LINK|ID> -o out.mp4 -c
```

Otherwise takes FFMPEG crop filter format

```
$ coub-dl -i <LINK|ID> -o out.mp4 -c 500:500:8
```

### RESIZE

Resize to 250 pixel width preserving aspect ratio:

```
$ coub-dl -i <LINK|ID> -o out.mp4 -s 250
```

Resize to 250x100

```
$ coub-dl -i <LINK|ID> -o out.mp4 -s 250x100
```

### ASPECT RATIO

Set the output's aspect ratio:

```
$ coub-dl -i <LINK|ID> -o out.mp4 -a 4:3
```

## Contributing

This is a very early build.
If you have any suggestions feel free to file an issue, or if you've already implemented changes PR's are also welcome.
