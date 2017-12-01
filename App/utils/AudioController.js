import Sound from 'react-native-sound';
import RNAudioStreamer from 'react-native-audio-streamer';

const MusicControl = require('react-native-music-control');

class AudioController {
	constructor() {
		this.audioProps = {}; //Propriedades do áudio atual: key*, title*, url*, author, thumbnail, path, currentTime, duration        
		this.player = null; //Instância do Sound ou do RNAudioStreamer
		this.paused = false;
		this.type = 'streaming';
	}

	load(currentAudio, callback) {
		//Apenas os dados do áudio atual são obrigatórios
		this.audioProps = currentAudio;

		//Verificar se o arquivo de áudio já foi baixado para definir player
		if (this.audioProps.path != null) {
			//Áudio offline, this.player será instância do Sound
			console.log('Audio offline');
			this.type = 'offline';
			Sound.setCategory('Playback', true);
			this.player = new Sound(this.audioProps.path, undefined, (error) => {
				if (error) return;
				(callback) ? callback(this.player.isLoaded()) : null;
			});
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
	}

	pause() {
		if (this.player == null) return;
		//Aqui deve ser implementada uma chamada para a função pause, independente da biblioteca
		this.player.pause();
		this.paused = true;
		clearInterval(this.pulse);
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
		});
		MusicControl.on('play', () => {
			this.play();
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