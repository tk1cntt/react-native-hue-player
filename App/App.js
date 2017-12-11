import React, { Component } from 'react';
import {
  StyleSheet,
  View
} from 'react-native';

import AudioControls from './components/AudioControls';

const playlist = [
  {
    key: 'audio1',
    title: 'Hino do Brasil',
    author: 'Francisco Manuel da Silva',
    url: 'http://www.noiseaddicts.com/samples_1w72b820/4170.mp3',
    thumbnail: 'http://www.aprocura.com.br/wp-content/uploads/2012/10/Significado-Cores-Bandeira-do-Brasil.jpg'
  },
  {
    key: 'audio2',
    title: 'Sweet Dreams - Eurythmics (Funk Remix)',
    author: 'Senhor Sider',
    url: '',
    path: 'audio1.mp3',
    thumbnail: 'https://lh3.googleusercontent.com/-SE7FQ1XW4ng/WTSYWArxKoI/AAAAAAAAA84/dan-oI2dryohk6fjm7NPShG5QAy03H17QCLcB/s600/Sweet-Dreams---%2528SENHOR-SIDER-FUNK-REMIX%2529-capa.jpg1200x630bb.jpg'
  }
];

export default class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <AudioControls
          initialTrack={0}
          playlist={playlist}

          //Thumbnail
          thumbnailSize={{ width: 200, height: 200 }}

          //Buttons
          activeButtonColor={'white'}
          inactiveButtonColor={'#888'}

          //Slider
          sliderMinimumTrackTintColor={'#888'}
          sliderMaximumTrackTintColor={'white'}
          sliderThumbTintColor={'white'}
          sliderTimeStyle={{ fontSize: 18, color: 'white' }}

          //Title and author
          titleStyle={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}
          authorStyle={{ fontSize: 16, color: 'white' }}

          hasButtonForForward
          timeForFoward={30}
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
    backgroundColor: 'black',
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
