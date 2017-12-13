# react-native-hue-player

HUE Player is intended to projects that need to deal with both offline/local and online/streaming audio.
Now you can play, pause, skip and seek audios from diferent sources on the same playlist.

This project is based on ['react-native-audio-streamer'] (https://github.com/indiecastfm/react-native-audio-streamer),
['react-native-sound'] (https://github.com/zmxv/react-native-sound) and uses ['react-native-music-control'] (https://github.com/tanguyantoine/react-native-music-control).

![print](/Example/prints/print1.jpg)
## Getting Started

In order to use this component you have to set up a playlist of audio files. Those audio files must have some attributes, as shown on the schema bellow: 

```js
const playlistSample = [
  {key: 'audio01', title:'Irineu', url: 'http://vocenaosabe.nem/eu.mp3'}, 
  {key: 'audio02', title:'SerjaoBerranteiro', url: 'http://aquitem.corage', path: 'matadorDeOnca.mp3'}
];
```
Note that the audio objects may have other fields, but "key", "title" and "url" are required.
By default the first track to be played is the first one on playlist array.

### Installing

Install on your project root using:

```shell
yarn add react-native-hue-player
```
or

```shell
npm install react-native-hue-player
```

This component is based on three other projects, so make sure you run the commands to link Android and iOS.

```js
react-native link react-native-audio-streamer
react-native link react-native-sound
react-native link react-native-music-control

```
### Usage

All you need to control your audio files is provided by the AudioController class, but if you want to use or customize our ready-to-go interface you can import the AudioControls component.

#### AudioControls

Basic usage:

```js
import { AudioControls } from 'react-native-hue-player';

...
<AudioControls
  initialTrack={1} // starts on second audio file
  playlist={playlistSample}
/>

```

Props:

|             Name              | Type              | Default | Description |
| ----------------------------- | ----------------- | ------- | ----------- |
| activeColor                   | color             | '#FFF'  | ----------- |
| inactiveColor                 | color             | '#888'  | ----------- |
| hasButtonForForward           | boolean           | false   | ----------- |
| timeForFoward                 | integer           | 15      | ----------- |
| thumbnailSize                 | image style props | -       | ----------- |
| titleStyle                    | text style props  | -       | ----------- |
| authorStyle                   | text style props  | -       | ----------- |
| activeButtonColor             | color             | '#FFF'  | ----------- |
| inactiveButtonColor           | color             | '#888'  | ----------- |
| sliderMinimumTrackTintColor   | color             | '#FFF'  | ----------- |
| sliderMaximumTrackTintColor   | color             | '#FFF'  | ----------- |
| sliderThumbTintColor          | color             | '#FFF'  | ----------- |