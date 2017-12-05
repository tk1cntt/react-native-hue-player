import MusicControl from 'react-native-music-control';
import Sound from 'react-native-sound';
import RNAudioStreamer from 'react-native-audio-streamer';

import { DeviceEventEmitter } from 'react-native';

class AudioController {
	constructor() {
		this.audioProps = {}; //Propriedades do áudio atual: key*, title*, url*, author, thumbnail, path, currentTime, duration        
		this.player = null; //Instância do Sound ou do RNAudioStreamer
		this.paused = true;
		this.type = 'streaming';
		this.playlist = [];
		this.currentIndex = 0;
		this.currentAudioListener = () => null;
		this.currentTimeListener = () => null;
		this.onChange = () => null;
		this.status = {
			PLAYING: 'PLAYING',
			LOADING: 'LOADING',
			LOADED: 'LOADED',
			PAUSED: 'PAUSED',
			STOPPED: 'STOPPED',
			SEEKING: 'SEEKING',
			ERROR: 'ERROR'
		}
	}

	init(playlist, track = 0, callback, currentAudioListener) {
		this.playlist = playlist;
		this.currentIndex = track;
		this.audioProps = playlist[track];
		this.currentAudioListener = currentAudioListener;
		this.setOnChange(callback);
		this.onChange(this.status.LOADING);
		this.load(this.audioProps, (isLoaded) => isLoaded ? this.onChange(this.status.LOADED) : null);
		this.subscription = DeviceEventEmitter.addListener('RNAudioStreamerStatusChanged', this.onStatusChanged.bind(this));
	}

	setCurrentTime(seconds) {
		seconds = parseInt(seconds);
		(this.type === 'streaming') ? this.player.seekToTime(seconds) : this.player.setCurrentTime(seconds);
		this.pause();
		this.play();
	}

	clearIntervalCurrentTimeListener() {
		clearInterval(this.currentTimeListener);
	}

	load(currentAudio, callback) {
		//console.log('this.playList', this.playlist);
		//Apenas os dados do áudio atual são obrigatórios
		this.audioProps = currentAudio;
		//Verificar se o arquivo de áudio já foi baixado para definir player
		if (this.audioProps.path) {
			//Áudio offline, this.player será instância do Sound
			this.type = 'offline';
			Sound.setCategory('Playback');
			this.player = new Sound(this.audioProps.path, Sound.MAIN_BUNDLE, (error) => {
				if (error) return;

				(callback) ? callback(() => this.player.isLoaded()) : null;
			});

		} else {
			//Áudio online, this.player será instância do RNAudioStreamer
			this.type = 'streaming';
			this.player = RNAudioStreamer;
			this.player.setUrl(this.audioProps.url);
			(callback) ? callback(true) : null;
		}

		//console.log(`Loading audio ${this.type}`, this.player, this.audioProps);

		this.startMusicControl();

		//Atualiza a duração do áudio
		this.getDuration(seconds => {
			this.audioProps.duration = seconds;
		});
	}

	play() {
		//console.log('AudioController.play()', this.player);

		if (this.player == null) return;

		//Aqui deve ser implementada uma chamada para a função play, independente da biblioteca
		(this.type === 'streaming') ? this.player.play() : this.player.play(this.onAudioFinish.bind(this));

		this.onAudioProgress();

		//Configura Player e Music Control para iniciar de onde o usuário parou
		if (typeof this.audioProps.currentTime !== 'undefined' && this.audioProps.currentTime >= 0) {
			this.seek(this.audioProps.currentTime);
		} else {
			console.log('Não tem currentTime', this.audioProps);
		}

		this.paused = false;
		this.onChange(this.status.PLAYING);
		this.music_control_play();
	}

	pause() {
		if (this.player == null) return;
		this.player.pause();
		this.audioProps.currentTime = parseInt(this.audioProps.currentTime);
		clearInterval(this.currentTimeListener);
		this.paused = true;
		this.onChange(this.status.PAUSED);
		this.music_control_pause();
	}

	seek(seconds) {
		seconds = parseInt(seconds);
		if (this.player == null) return;
		//Aqui deve ser implementada uma chamada para a função seek, independente da biblioteca
		//console.log('seek To ', seconds, this.player);
		(this.type === 'streaming') ? this.player.seekToTime(seconds) : this.player.setCurrentTime(seconds);
		//Atualiza tempo atual
		this.audioProps.currentTime = seconds;
		this.currentAudioListener(seconds);
		this.music_control_seek(seconds);
		this.music_control_refresh();
	}

	skip(seconds) {
		if (this.player == null) return;
		//Aqui deve ser implementada uma chamada para a função skip, independente da biblioteca	
		this.getDuration(duration => {
			this.getCurrentTime(currentTime => {
				let time = currentTime + seconds;
				if (time < 0) time = 0;
				else if (time > duration) time = duration;
				this.seek(time); //seconds
			});
		});
	}

	hasTrack(index) {
		return this.playlist[index] ? true : false;
	}

	hasNext() {
		return this.playlist[this.currentIndex + 1] ? true : false;
	}

	hasPrevious() {
		return this.playlist[this.currentIndex - 1] ? true : false;
	}

	playNext() {
		this.playAnotherTrack(this.currentIndex + 1);
	}

	playPrevious() {
		this.playAnotherTrack(this.currentIndex - 1);
	}

	playAnotherTrack(index) {
		if (!this.hasTrack(index)) {
			return; // O próximo indice deve ser um indice válido na playlist
			//throw 'Playlist must contain index of next audio'
		}
		this.currentIndex = index;
		this.pause();
		this.selectedAudio = this.playlist[this.currentIndex];
		this.load(this.selectedAudio, (isLoaded) => {
			this.play();
			if (isLoaded) {
				if (this.type !== 'streaming') this.onChange(this.status.LOADED);
			} else return null;
		});
	}

	setOnChange(callback) {
		this.onChange = callback;
	}

	getAudioProps() {
		return this.audioProps;
	}

	getCurrentTime(callback) {
		if (this.player == null) return;
		if (this.type == 'streaming')
			this.player.currentTime((err, seconds) => {
				if (!err) callback(seconds);
			});
		else {
			this.player.getCurrentTime(callback);
		}
	}

	onStatusChanged(status) {
		//console.log('Streamer status', status);
		if (status === 'PAUSED' || status === 'PLAYING') {
			this.onChange(this.status.LOADED);
		}
	}

	getDuration(callback) {
		if (this.player == null) return;
		if (this.type == 'streaming') {
			this.player.duration((err, seconds) => {
				if (!err && seconds > 0)
					callback(seconds);
				else {
					callback(-1);
				}
			});
		} else if (this.player.getDuration() > 0) {
			callback(this.player.getDuration());
		}
	}

	isPlaying(callback) {
		if (this.player == null) return;
		if (this.type === 'streaming') {
			this.player.status((err, status) => {
				if (!err) {
					callback(status === 'PLAYING' ? true : false);
				} else {
					callback(false);
				}
			});
		} else {
			this.player.getCurrentTime((seconds, isPLaying) => callback(isPlaying));
		}
	}

	onAudioProgress() {
		//Atualizando currentTime na audioProps
		this.currentTimeListener = setInterval(() => {
			this.getCurrentTime(seconds => {
				this.audioProps.currentTime = seconds;
				this.currentAudioListener(seconds);
			});
		}, 1000);
	}

	onAudioFinish() {
		this.music_control_reset();
		clearInterval(this.currentTimeListener);
	}

	//------------Alterar Estados do Music Control------------//

	musicControlsEnableControls() {
		MusicControl.enableControl('skipBackward', true, { interval: 30 });
		MusicControl.enableControl('skipForward', true, { interval: 30 });
		MusicControl.enableControl('play', true);
		MusicControl.enableControl('pause', true);
	}

	startMusicControl() {
		this.getDuration((duration) => {
			this.initializeMusicControlEvents();
			MusicControl.setNowPlaying({
				title: this.audioProps.title, //OK
				artwork: this.audioProps.thumbnail, //OK
				artist: this.audioProps.author, //OK
				album: this.audioProps.author ? this.audioProps.author : '',
				duration, // Not OK
				description: '', // Android Only
				color: 0x555555, // Notification Color - Android Only
				date: '', // Release Date (RFC 3339) - Android Only
			});
			this.musicControlsEnableControls();
		});
	}

	music_control_pause() {
		this.getCurrentTime((elapsedTime) => {
			MusicControl.updatePlayback({
				state: MusicControl.STATE_PAUSED,
				elapsedTime
			});
		});
	}

	music_control_play() {
		this.getCurrentTime((elapsedTime) => {
			MusicControl.updatePlayback({
				state: MusicControl.STATE_PLAYING,
				elapsedTime
			});
		});
	}

	music_control_refresh() {
		this.getDuration((duration) => {
			this.getCurrentTime((elaspsedTime) => {
				MusicControl.updatePlayback({
					elaspsedTime,
					duration,
				});
			});
		})
	}

	music_control_seek(elaspsedTime) {
		this.getDuration((duration) => {
			MusicControl.updatePlayback({
				elaspsedTime,
				duration
			});
		});
	}

	music_control_reset() {
		MusicControl.resetNowPlaying();
	}

	initializeMusicControlEvents() {
		MusicControl.on('pause', () => {
			this.pause();
			this.music_control_pause();
		});
		MusicControl.on('play', () => {
			this.play();
			this.music_control_play();
		});
		MusicControl.on('skipForward', () => {
			this.skip(30);
		}); // iOS only
		MusicControl.on('skipBackward', () => {
			this.skip(-30);
		}); // iOS only

	}
}

export default new AudioController();
