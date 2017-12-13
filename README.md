# react-native-hue-player

HUE Player is intended to projects that need to deal with both offline/local and online/streaming audio.
Now you can play, pause, skip and seek audios from diferent sources on the same playlist.

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

This component is based on three other projects 'react-native-music-control', 'react-native-sound' and 'react-native-audio-streamer', so make sure you run the commands to link Android and iOS.

```
react-native link react-native-audio-streamer
react-native link react-native-sound
react-native link react-native-music-control

```
