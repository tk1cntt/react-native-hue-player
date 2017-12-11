import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Image,
    TouchableOpacity,
    Slider,
    Text,
    Dimensions
} from 'react-native';
import moment from 'moment';
import 'moment/locale/pt-br';

import images from '../../config/images';
import colors from '../../config/colors';
import AudioController from '../../utils/AudioController';

const { width } = Dimensions.get('window');

class AudioControls extends Component {
    constructor(props) {
        super(props);

        this.state = {
            duration: 0,
            currentTime: 0,
            currentAudio: {},
            isReady: true,
            isPlaying: false
        };
    }

    componentWillMount() {
        const { playlist, initialTrack } = this.props;
        AudioController.init(playlist, initialTrack, this.onChangeStatus, this.updateCurrentTime);
    }

    onChangeStatus = (status) => {
        switch (status) {
            case AudioController.status.PLAYING:
                this.setState({ isPlaying: true });
                break;
            case AudioController.status.PAUSED:
                this.setState({ isPlaying: false });
                break;
            case AudioController.status.STOPPED:
                this.setState({ isPlaying: false });
                break;
            case AudioController.status.LOADED:
                AudioController.getDuration((seconds) => {
                    this.setState({ duration: seconds });
                });
                this.setState({ currentAudio: AudioController.currentAudio });
                break;
            case AudioController.status.ERROR:
                console.log('Status Error');
                break;
            default:
                return;
        }
    }

    updateCurrentTime = (seconds) => {
        this.setState({ currentTime: seconds });
    }

    renderPlayerIcon() {
        const { isPlaying } = this.state;
        if (isPlaying) {
            return (
                <TouchableOpacity
                    onPress={() => AudioController.pause()}
                >
                    <Image
                        source={images.iconPause}
                        style={styles.playButton}
                    />
                </TouchableOpacity >
            );
        }

        return (
            <TouchableOpacity
                onPress={() => AudioController.play()}
            >
                <Image
                    source={images.iconPlay}
                    style={styles.playButton}
                />
            </TouchableOpacity >
        );
    }

    renderNextIcon() {
        if (AudioController.hasNext()) {
            return (
                <TouchableOpacity
                    onPress={() => AudioController.playNext()}
                >
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
                <TouchableOpacity
                    onPress={() => {
                        AudioController.playPrevious();
                    }}
                >
                    <Image source={images.iconPrevious} style={styles.previousButton} />
                </TouchableOpacity>
            );
        }
        return (
            <Image
                source={images.iconPrevious}
                style={[styles.previousButton, { tintColor: '#888' }]}
            />
        );
    }

    renderSkipbackwardIcon() {
        return (
            <TouchableOpacity
                onPress={() => {
                    AudioController.seekToForward(-this.props.timeForFoward);
                }}
            >
                <Image
                    source={images.skipBackward}
                    style={styles.skipBackwardButton}
                />
            </TouchableOpacity>
        );
    }

    renderSkipforwardIcon() {
        return (
            <TouchableOpacity
                onPress={() => {
                    AudioController.seekToForward(this.props.timeForFoward);
                }}
            >
                <Image
                    source={images.skipForward}
                    style={styles.skipForwardButton}
                />
            </TouchableOpacity>
        );
    }

    render() {
        const { currentTime, duration } = this.state;
        return (
            <View style={styles.container}>
                <Image
                    source={{ uri: this.state.currentAudio.thumbnail }}
                    style={styles.thumbnail}
                />
                <Text style={styles.title}>{this.state.currentAudio.title}</Text>
                <Text style={styles.author}>{this.state.currentAudio.author}</Text>
                <View style={styles.playbackContainer}>
                    <Text numberOfLines={1} style={styles.timeLabel}>
                        {currentTime
                            ? moment(currentTime * 1000).format('mm:ss')
                            : '00:00'}
                    </Text>
                    <Slider
                        value={currentTime}
                        maximumValue={duration}

                        style={styles.playbackBar}

                        minimumTrackTintColor={colors.darkGrey}

                        maximumTrackTintColor={colors.green}
                        thumbTintColor={colors.green}

                        onSlidingComplete={seconds => {
                            AudioController.seek(seconds);
                            if (seconds < duration) AudioController.play();
                        }}
                        onValueChange={() => AudioController.clearCurrentTimeListener()}
                    />
                    <Text numberOfLines={1} style={styles.timeLabel}>
                        {duration ? moment(duration * 1000).format('mm:ss') : '00:00'}
                    </Text>
                </View>
                <View style={styles.buttonsContainer}>
                    {this.renderSkipbackwardIcon()}
                    {this.renderPreviousIcon()}
                    {this.renderPlayerIcon()}
                    {this.renderNextIcon()}
                    {this.renderSkipforwardIcon()}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
    },
    playbackContainer: {
        flexDirection: 'row'
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    thumbnail: {
        width: width * 0.6,
        height: width * 0.6
    },
    title: {
        fontSize: 16
    },
    author: {
        fontSize: 14
    },
    timeLabel: {
        paddingHorizontal: 2
    },
    playbackBar: {
        width: '70%'
    },
    playButton: {
        width: 80,
        height: 80
    },
    previousButton: {
        width: 20,
        height: 20,
        margin: 5
    },
    nextButton: {
        width: 20,
        height: 20,
        margin: 5
    },
    skipBackwardButton: {
        width: 25,
        height: 25,
        margin: 5
    },
    skipForwardButton: {
        width: 25,
        height: 25,
        margin: 5
    }
});

export default AudioControls;
