import { AsyncStorage } from 'react-native';
import AudioController from './AudioController';

class AudioManager {
    constructor() {
        this.audios = {}; // Objeto contendo mesclagem entre dados vindos do banco remoto e local
        this.library = {}; // Objeto contendo apenas os dados vindo do bando local (Indica os audios já ouvidos pelo usuário ou baixados)
        this.playlist = []; // Atual playlist sendo ouvida pelo usuário. Array de chaves dos audios
        this.currentIndex = null; // Indice atual do audio sendo tocado na playlist
        this.currentAudio = {}; // Audio atual com todas as propriedades referêntes ao audio
        this.currentTime = 0;
        this.selectedAudio = null; // Audio selecionado pelo player para ser executado a seguir
        this.duration = 0;
        this.durationPulse = null;
    }

    initializeData(audios, library = null) {
        if (library) {
            this.library = library;
            Object.assign(audios, this.library);
            this.audios = audios;
        } else {
            this.loadLibrary().then((result) => {
                if (result) {
                    this.library = {}; //JSON.parse(result);
                    Object.assign(audios, this.library);
                    this.audios = audios;
                }
            });
        }
    }

    loadLibrary() {
        return new Promise((resolve, reject) => {
            AsyncStorage.getItem('@audios', (error, result) => {
                if (!error) resolve(result);
                else reject(error);
            });
        });
    }

    loadAudio(callback, selectedAudio, playlist, audioIndex) {
        this.selectedAudio = selectedAudio;
        this.playlist = playlist;
        this.currentIndex = audioIndex;

        AudioController.load(this.selectedAudio, callback);
    }

    initializeListenersAndTimers() {
        this.durationPulse = setInterval(() => {
            AudioController.getDuration(duration => {
                this.duration = duration;
            });
        }, 1000);

        this.currentTimePulse = setInterval(() => {
            AudioController.getCurrentTime(currentTime => {
                this.currentTime = currentTime;
            });
        }, 1000);

        this.savePulse = setInterval(() => {
            this.saveProgress();
        }, 10000);
    }

    getLibrary() {
        return this.library;
    }

    getCurrentTime(callback) {
        callback(this.currentTime);
    }

    getDuration(callback) {
        callback(this.duration);
    }

    getProgress(callback) {
        if (this.duration && this.currentTime) {
            const progress = this.currentTime / this.duration;
            callback(progress);
        } else {
            callback(-1);
        }
    }

    removeListeners() {
        clearInterval(this.currentTimePulse);
        clearInterval(this.durationPulse);
        clearInterval(this.savePulse);
    }

    static updatePlaylist(playlist) {
        if (!Array.isArray(playlist)) {
            return; // Parametro deve ser um array
            //throw 'Parameter must be a array'
        }
        if (!playlist.length) {
            return; //Array teve ter pelo menos um elemento
            //throw 'Array must have at least one element'
        }
        //Verificar se vai ser necessário fazer update do currentIndex e currentAudio aqui para não crashar a aplicação.
        this.playlist = playlist;
    }

    nextAudio() {
        console.log('Next Audio on AudioManager');
        let nextIndex = this.currentIndex + 1;
        if (!this.playlist[nextIndex]) {
            return; // O próximo indice deve ser um indice válido na playlist
            //throw 'Playlist must contain index of next audio'
        }
        this.currentIndex = nextIndex;
        this.selectedAudio = this.audios[this.playlist[nextIndex]];
    }

    previousAudio() {
        let previousIndex = this.currentIndex - 1;
        if (!this.playlist[previousIndex]) {
            return; // O próximo indice deve ser um indice válido na playlist
            //throw 'Playlist must contain index of next audio'
        }
        this.currentIndex = previousIndex;
        this.currentAudio = this.audios[this.playlist[previousIndex]];
        //Verificar se vai ser aqui que vai ser chamado o load do próximo audio
    }

    hasNext() {
        let nextIndex = this.currentIndex + 1;
        let hasNext = this.playlist[nextIndex] ? true : false;
        //console.log('hasNext? ', hasNext);
        return hasNext;
    }

    hasPrevious() {
        let previousIndex = this.currentIndex - 1;
        let hasPrevious = this.playlist[previousIndex] ? true : false;
        //console.log('hasPrevious? ', hasPrevious);
        return hasPrevious;
    }

    saveProgress() {
        if (this.currentIndex == null || !this.currentAudio) {
            return;
        }

        let { key } = this.currentAudio;
        let propsMerge = {};

        Object.assign(propsMerge, this.audios[key], {
            currentTime: this.currentTime,
            duration: this.duration
        });

        this.library[key] = propsMerge;
        this.audios[key] = propsMerge;

        AsyncStorage.setItem('@audios', JSON.stringify(this.library));
    }

    addNext(key) {
        this.library.push(key);
    }

    isPlaying(callback) {
        AudioController.isPlaying(callback);
    }

    skip(timeInSeconds, callback = null) { // TODO    
        AudioController.skip(timeInSeconds);
        (callback) ? callback() : null;
    }

    removeAudioProgress(key) { //TODO
        console.log('this.library', this.library);
        //Remove audio de library
        delete this.library[key].currentTime;
        //atualizar this. audios ex: delete this.audios[key].path, isDownloaded, currentTime
        delete this.audios[key].currentTime;
        console.log('this.library', this.library);
        //Update AsyncStorage
        AsyncStorage.setItem('@audios', JSON.stringify(this.library));
    }

    play() {
        this.currentAudio = this.selectedAudio;
        AudioController.play();
        this.initializeListenersAndTimers();
    }

    pause() {
        AudioController.pause();
        this.removeListeners();
    }

    seek(seconds) {
        AudioController.seek(seconds);
    }

}

export default new AudioManager();