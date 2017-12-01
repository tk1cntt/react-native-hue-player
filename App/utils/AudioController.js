import MusicControl from 'react-native-music-control';
import Sound from 'react-native-sound';
import RNAudioStreamer from 'react-native-audio-streamer';

class AudioController {
	constructor() {
		this.audioProps = {}; //Propriedades do áudio atual: key*, title*, url*, author, thumbnail, path, currentTime, duration        
		this.player = null; //Instância do Sound ou do RNAudioStreamer
		this.paused = true;
		this.type = 'streaming';
		this.playlist = [];
		this.currentIndex = 0;
		this.status = {
			PLAYING: 'PLAYING',
			LOADING: 'LOADING',
			PAUSED: 'PAUSED',
			STOPPED: 'STOPPED',
			SEEKING: 'SEEKING',
			ERROR: 'ERROR'
		}
	}

	init(playlist, track = 0, callback) {
		this.playlist = playlist;
		this.currentIndex = track;
		this.audioProps = playlist[track];
		this.load(this.audioProps, null);
		this.setOnChange(callback);
	}

	load(currentAudio, callback) {
		//Apenas os dados do áudio atual são obrigatórios
		this.audioProps = currentAudio;

		//Verificar se o arquivo de áudio já foi baixado para definir player
		if (this.audioProps.path != null) {
			//Áudio offline, this.player será instância do Sound
			console.log('Audio offline');
			this.type = 'offline';
			Sound.setCategory('Playback');
			this.player = new Sound(this.audioProps.path, Sound.MAIN_BUNDLE, (error) => {
				if (error) {
					console.log('Error', error);
					return;
				}
				(callback) ? callback(this.player.isLoaded()) : null;
			});
			console.log('duration in seconds: ' + this.player.getDuration() + 'number of channels: ' + this.player.getNumberOfChannels());
		} else {
			//Áudio online, this.player será instância do RNAudioStreamer			
			this.audioProps.type = 'streaming';
			this.player = RNAudioStreamer;
			console.log('Loading audio streaming', this.player, this.audioProps);
			this.player.setUrl(this.audioProps.url);
			(callback) ? callback(true) : null;
		}

		this.startMusicControl();

		//Configura Player e Music Control para iniciar de onde o usuário parou
		if (typeof this.audioProps.currentTime !== 'undefined') {
			this.seek(this.audioProps.currentTime);
			this.music_control_seek(this.audioProps.currentTime);
		} else {
			console.log('Não tem currentTime', this.audioProps);
		}

		//Atualiza a duração do áudio
		this.getDuration(seconds => {
			this.audioProps.duration = seconds;
		});

	}

	play() {
		if (this.player == null) return;
		//Aqui deve ser implementada uma chamada para a função play, independente da biblioteca
		(this.type === 'streaming') ? this.player.play() : this.player.play(this.onAudioFinish.bind(this));
		this.paused = false;
		this.onChange(this.status.PLAYING);
		this.music_control_play();
	}

	pause() {
		if (this.player == null) return;
		this.player.pause();
		this.paused = true;
		this.onChange(this.status.PAUSED);
		this.music_control_pause();
	}

	seek(seconds) {
		console.log('seek To ', seconds, this.player);
		if (this.player == null) return;
		//Aqui deve ser implementada uma chamada para a função seek, independente da biblioteca
		(this.type == 'streaming') ? this.player.seekToTime(seconds) : this.player.setCurrentTime(seconds);
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

	hasNext() {
		const nextIndex = this.currentIndex + 1;
		return this.playlist[nextIndex] ? true : false;
	}

	hasPrevious() {
		const previousIndex = this.currentIndex - 1;
		return this.playlist[previousIndex] ? true : false;
	}

	playNext() {
		console.log('Next Audio on AudioController');
		const nextIndex = this.currentIndex + 1;
		if (hasNext()) {
			return; // O próximo indice deve ser um indice válido na playlist
			//throw 'Playlist must contain index of next audio'
		}
		this.currentIndex = nextIndex;
		this.selectedAudio = this.playlist[nextIndex];
	}

	playPrevious() {
		let previousIndex = this.currentIndex - 1;
		if (!this.playlist[previousIndex]) {
			return; // O próximo indice deve ser um indice válido na playlist
			//throw 'Playlist must contain index of next audio'
		}
		this.currentIndex = previousIndex;
		this.currentAudio = this.audios[this.playlist[previousIndex]];
		//Verificar se vai ser aqui que vai ser chamado o load do próximo audio
	}

	onChange(status) {
		return;
	}

	setOnChange(callback) {
		this.onChange = callback;
	}

	getAudioProps(callback) {
		callback(this.audioProps);
	}

	getCurrentTime(callback) {
		if (this.player == null) return;
		if (this.type == 'streaming')
			this.player.currentTime((err, seconds) => {
				if (!err)
					callback(seconds);
			});
		else
			this.player.getCurrentTime(callback);
	}

	getDuration(callback) {
		if (this.player == null) return;
		if (this.type == 'streaming') {
			this.player.duration((err, seconds) => {
				if (!err)
					callback(seconds);
				else
					callback(-1);
			});
		} else {
			callback(this.player.getDuration());
		}
	}

	isPlaying(callback) {
		if (this.player == null) return;
		if (this.type === 'streaming') {
			this.player.status((err, status) => {
				if (!err) {
					if (status === 'PLAYING') {
						callback(true);
					} else {
						callback(false);
					}
				} else {
					callback(false);
				}
			});
		} else {
			this.player.getCurrentTime((seconds, isPLaying) => {
				callback(isPlaying);
			});
		}
	}

	onAudioProgress(callback) {
		//Atualizando currentTime na audioProps
		this.pulse = setInterval(() => {
			this.getCurrentTime(seconds => {
				this.audioProps.currentTime = seconds;
				callback(seconds);
			});
		}, 1000);
	}

	onAudioFinish() {
		this.music_control_reset();
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