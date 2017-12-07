/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';

import AudioControls from './components/AudioControls';
import AudioController from './utils/AudioController';
import colors from './config/colors';

const playlist = [
  // key*, title*, url*, author, thumbnail, path, currentTime, duration
  {
    key: 'audio1',
    title: 'Áudio 01',
    url: 'https://s3-sa-east-1.amazonaws.com/claudio-henrique/podcasts/POD_1.mp3',
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/claudio-henrique.appspot.com/o/podcasts%2Fcovers%2Fpodcast-cover.png?alt=media&token=4a639782-4d3f-40fd-99ec-450efad2b681'
  },
  {
    key: 'audio2',
    title: 'Áudio 02',
    url: 'https://s3-sa-east-1.amazonaws.com/claudio-henrique/podcasts/POD_1.mp3',
    path: 'audio2.mp3',
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/claudio-henrique.appspot.com/o/podcasts%2Fcovers%2Fpodcast-cover2.png?alt=media&token=005cb0e0-81ac-4449-83c7-0aef092140ea'
  },
  {
    key: 'audio3',
    title: 'Áudio 03',
    url: 'https://s3-sa-east-1.amazonaws.com/claudio-henrique/podcasts/POD_1.mp3',
    thumbnail: 'https://firebasestorage.googleapis.com/v0/b/claudio-henrique.appspot.com/o/podcasts%2Fcovers%2Fpodcast-cover.png?alt=media&token=4a639782-4d3f-40fd-99ec-450efad2b681'
  }
];

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <AudioControls initialTrack={0} playlist={playlist} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
