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
    url: 'https://s3-sa-east-1.amazonaws.com/claudio-henrique/podcasts/POD_1.mp3'
  },
  {
    key: 'audio2',
    title: 'Áudio 02',
    url: 'https://s3-sa-east-1.amazonaws.com/claudio-henrique/podcasts/POD_1.mp3',
    path: 'audio2.mp3'
  },
  {
    key: 'audio3',
    title: 'Áudio 03',
    url: 'https://s3-sa-east-1.amazonaws.com/claudio-henrique/podcasts/POD_1.mp3'
  }
];

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isPlaying: false
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
        <AudioControls
          initialTrack={0}
          playlist={playlist}
        />
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
