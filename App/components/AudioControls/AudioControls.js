import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Image,
    TouchableOpacity,
    Slider,
    Text
} from 'react-native';
import 'moment/locale/pt-br';

import images from '../../config/images';
import colors from '../../config/colors';
import AudioController from '../../utils/AudioController';

const moment = require('moment');

moment.locale('pt-BR');

class AudioControls extends Component {
    constructor(props) {
        super(props);

        this.state = {
            duration: 0,
            currentTime: 0,
            isReady: true,
            isPlaying: false
        };
    }

    componentWillMount() {
        const { playlist, initialTrack } = this.props;
        AudioController.init(playlist, initialTrack, this.onChangeStatus);
    }

    onChangeStatus = (status) => {
        console.log('Status changed', status);
        switch (status) {
            case AudioController.status.PLAYING:
                this.setState({ isPlaying: true });
                AudioController.getDuration((seconds) => {
                    console.log('seconds', seconds);
                    this.setState({ duration: seconds });
                });
                break;
            case AudioController.status.PAUSED:
                this.setState({ isPlaying: false });
                break;
            case AudioController.status.LOADED:
                break;
            default:
                break;
        }
    }

    renderPlayerIcon() {
        const { isPlaying } = this.state;
        return (
            <TouchableOpacity
                onPress={() => (isPlaying) ? AudioController.pause() : AudioController.play()}
            >
                <Image
                    source={(isPlaying) ? images.iconPause : images.iconPlay}
                    style={styles.playButton}
                />
            </TouchableOpacity>
        );
    }

    renderNextIcon() {
        if (AudioController.hasNext()) {
            return (
                <TouchableOpacity onPress={() => {
                    AudioController.playNext();
                }} >
                    <Image source={images.iconNext} style={styles.nextButton} />
                </TouchableOpacity>
            );
        }
        return (
            <Image source={images.iconNext} style={[styles.nextButton, { tintColor: '#888' }]} />
        );
    }

    renderPreviousIcon() {
        if (AudioController.hasPrevious()) {
            return (
                <TouchableOpacity onPress={() => {
                    AudioController.playPrevious();
                }} >
                    <Image source={images.iconPrevious} style={styles.previousButton} />
                </TouchableOpacity>
            );
        }
        return (
            <Image source={images.iconPrevious} style={[styles.previousButton, { tintColor: '#888' }]} />
        );
    }

    render() {
        const { currentTime, duration } = this.state;
        return (
            <View style={styles.container}>
                <View style={styles.playbackContainer}>
                    <Text numberOfLines={1} style={styles.timeLabel}>
                        {currentTime
                            ? moment(currentTime * 1000).format("mm:ss")
                            : "00:00"}
                    </Text>
                    <Slider
                        value={currentTime}
                        maximumValue={duration ? duration : 1}
                        style={styles.playbackBar}
                        minimumTrackTintColor={colors.darkGrey}
                        maximumTrackTintColor={colors.green}
                        thumbTintColor={colors.green}
                        value={currentTime}
                        onSlidingComplete={seconds => {
                            console.log('goto ' + seconds + 's');
                            AudioController.seek(seconds);
                        }}
                        onValueChange={seconds => {
                            this.setState({ currentTime: seconds });
                            AudioController.seek(seconds);
                        }}
                    />
                    <Text numberOfLines={1} style={styles.timeLabel}>
                        {duration
                            ? moment(duration * 1000).format("mm:ss")
                            : "00:00"}
                    </Text>
                </View>
                <View style={styles.buttons}>
                    {this.renderPreviousIcon()}
                    {this.renderPlayerIcon()}
                    {this.renderNextIcon()}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        width: "100%"
    },
    buttons: {
        alignItems: "center",
        justifyContent: 'center',
        flexDirection: 'row',
        width: '100%'
    },
    playButton: {
        width: 80,
        height: 80
    },
    previousButton: {
        width: 15,
        height: 15,
        marginHorizontal: 20
    },
    nextButton: {
        width: 15,
        height: 15,
        marginHorizontal: 20
    },
    playbackContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center"
    },
    timeLabel: {
        paddingHorizontal: 2
    },
    playbackBar: {
        flex: 6
    }
});

export default AudioControls;
