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
// import AudioManager from '../../utils/AudioManager';
// import AudioController from '../../utils/AudioController';

const moment = require('moment');

moment.locale('pt-BR');

class AudioControls extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isPlaying: false,
            duration: 0,
            currentTime: 0,
            isReady: true
        };
    }

    componentWillMount() {

    }

    componentWillUnmount() {

    }

    _togglePlay() {

    }

    _handlePlayerIcon() {
        const { isPlaying, isReady } = this.state;
        if (!isReady) {
            return (
                <Image
                    source={images.iconPlay}
                    style={[styles.playButton, { tintColor: colors.darkGrey }]}
                />
            );
        }
        if (isPlaying) {
            return (
                <TouchableOpacity
                    onPress={() => {
                        this.setState({ isPlaying: !isPlaying });
                        this._togglePlay();
                        this.props.playHandler();
                    }}
                >
                    <Image
                        source={images.iconPause}
                        style={styles.playButton}
                    />
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    onPress={() => {
                        this.setState({ isPlaying: !isPlaying });
                        this._togglePlay();
                        this.props.playHandler();
                    }}
                >
                    <Image source={images.iconPlay} style={styles.playButton} />
                </TouchableOpacity>
            );
        }
    }

    _handleNextIcon() {

    }

    _handlePreviousIcon() {

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
                            // AudioManager.seek(seconds);
                        }}
                        onValueChange={seconds => {
                            this.setState({ currentTime: seconds });
                            // AudioManager.seek(seconds);
                        }}
                    />
                    <Text numberOfLines={1} style={styles.timeLabel}>
                        {duration
                            ? moment(duration * 1000).format("mm:ss")
                            : "00:00"}
                    </Text>
                </View>
                <View style={styles.buttons}>
                    {this._handlePreviousIcon()}
                    {this._handlePlayerIcon()}
                    {this._handleNextIcon()}
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
