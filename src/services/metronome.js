import BufferLoader from './buffer-loader.js';

const DEFAULT_BPM = 120;
const DEFAULT_VOLUME = 0.7;
const VOLUME_CHANGE_INCREMENT = 0.1;
const DEFAULT_NOTE_RESOLUTION = 4;
const ACCENT_NOTE_PLAYBACK_VALUE = 1.1;
// Break each loop/measure up into 16 notes
const LAST_NOTE_OF_BAR_IN_FOUR = 16;
const LAST_NOTE_OF_BAR_IN_THREE = 12;
// in milliseconds
const INTERVAL_FOR_TIME_CHECK = 25;
// in seconds
const SCHEDULE_AHEAD_TIME = 0.1;

// Setup global AudioContext variable for different browsers
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// The timing aspect of this metronome is a slightly modified version of:
// https://github.com/cwilso/metronome/blob/master/js/metronome.js
class Metronome {
  _lastNoteOfBar = LAST_NOTE_OF_BAR_IN_FOUR;
  _noteResolution = DEFAULT_NOTE_RESOLUTION;
  _bpm = DEFAULT_BPM;
  _current16thNoteInBar = 0;
  _timeCheckIntervalId = null;
  _clickBuffers = [];
  _nextNoteTime = 0.0;
  _clickType = 3;
  _accentFirstBeat = false;
  _clickGainNode = null;
  _audioContext = null;
  _isOn = false;

  constructor() {
    this._audioContext = new AudioContext();
    // The gain node is used to control volume
    this._clickGainNode = this._audioContext.createGain();
    this._clickGainNode.connect(this._audioContext.destination);
    this._clickGainNode.gain.value = DEFAULT_VOLUME;
    this._loadClickAudio();
  }

  stop() {
    this._clearInterval();
    this._isOn = false;
  }

  start(onNoteClick) {
    this._clearInterval();
    this._current16thNoteInBar = 0;
    this._nextNoteTime = this._audioContext.currentTime;
    this._isOn = true;

    this._timeCheckIntervalId = window.setInterval(() => {
      this._scheduleClick(onNoteClick);
    }, INTERVAL_FOR_TIME_CHECK);
  }

  isOn() {
    return this._isOn;
  }

  bpm(newBpm) {
    if (newBpm) {
      this._bpm = newBpm;
    }

    return this._bpm;
  }

  clickType(cycleClick) {
    if (cycleClick) {
      const nextClickType = (this._clickType + 1) % this._clickBuffers.length;
      this._clickType = nextClickType;
    }

    return this._clickType;
  }

  noteResolution(resolution) {
    if (resolution && resolution !== this._noteResolution) {
      this._noteResolution = resolution;
    }

    return this._noteResolution;
  }

  accentFirstBeat(toggle) {
    if (toggle) {
      if (!this._accentFirstBeat) {
        this._accentFirstBeat = true;
      } else if (this._accentFirstBeat && !this.isInThree()) {
        this._lastNoteOfBar = LAST_NOTE_OF_BAR_IN_THREE;
      } else {
        this._accentFirstBeat = false;
        this._lastNoteOfBar = LAST_NOTE_OF_BAR_IN_FOUR;
      } 
    }

    return this._accentFirstBeat;
  }

  isInThree() {
    if (this._lastNoteOfBar === LAST_NOTE_OF_BAR_IN_THREE) {
      return true;
    }

    return false;
  }

  increaseVolume() {
    const currentVolume = this._clickGainNode.gain.value;
    const roundedValue = Math.round(currentVolume * 10) / 10;

    if (roundedValue >= 1) {
      return;
    } else {
      this._clickGainNode.gain.value = roundedValue + VOLUME_CHANGE_INCREMENT;
    }
  }

  decreaseVolume() {
    const currentVolume = this._clickGainNode.gain.value;
    const roundedValue = Math.round(currentVolume * 10) / 10;

    if (roundedValue <= 0) {
      return;
    } else {
      this._clickGainNode.gain.value = roundedValue - VOLUME_CHANGE_INCREMENT;
    }
  }

  _clearInterval() {
    window.clearInterval(this._timeCheckIntervalId);
    this._timeCheckIntervalId = null;
  }

  _loadClickAudio() {
    const audioCLickFileList = [
      'clicks/click-0.mp3',
      'clicks/click-1.mp3',
      'clicks/click-2.mp3',
      'clicks/click-3.mp3',
    ];

    const bufferLoader = new BufferLoader(
      this._audioContext,
      audioCLickFileList,
      this._initClickAudio
    );
  
    bufferLoader.load();
  }

  _initClickAudio = (bufferList) => {
    for (let index = 0; index < bufferList.length; index++) {
      const buffer = bufferList[index];
      this._clickBuffers.push(buffer);
    }
  }

  _scheduleClick = (onNoteClick) => {
    // safeguard against infinite loop
    let loopCount = 0;
    const loopMax = 1000;
    const shouldScheduleNote = () => {
      return this._nextNoteTime < (this._audioContext.currentTime + SCHEDULE_AHEAD_TIME);
    };

    while (shouldScheduleNote() && (loopCount < loopMax)) {
      this._scheduleNote(this._current16thNoteInBar, this._nextNoteTime, onNoteClick);
      this._advanceCurrentNote();
      loopCount++;
    }
  }

  _scheduleNote = (beatNumber, time, onNoteClick) => {
    // Don't play every 16th beat when we only want 8ths or 4ths
    const shouldPlayBeat = !(beatNumber % (this._lastNoteOfBar / this._noteResolution));

    if (shouldPlayBeat) {
      const shouldAccentNote = beatNumber === 0 && this._accentFirstBeat;
      const click = this._generateClickSource(this._clickType);

      if (shouldAccentNote) {
        click.playbackRate.value = ACCENT_NOTE_PLAYBACK_VALUE;
      }

      click.start(time);

      if (onNoteClick) {
        // Call the callback passed in when metronome was started at the 
        // *approx* same time as when click will happen
        setTimeout(onNoteClick, time - this._audioContext.currentTime);
      }
    }
  }

  _advanceCurrentNote = () => {
    const secondsPerBeat = 60.0 / this._bpm;
    // 0.25 converts quarter note to 16th note
    this._nextNoteTime += 0.25 * secondsPerBeat;
    this._current16thNoteInBar = (this._current16thNoteInBar + 1) % LAST_NOTE_OF_BAR_IN_FOUR;
  }

  _generateClickSource = (clickNumber) => {
    const newSource = this._audioContext.createBufferSource();
    const buffer = this._clickBuffers[clickNumber];

    if (buffer) {
      newSource.buffer = buffer;
      newSource.connect(this._clickGainNode);
      return newSource;
    } else {
      return null;
    }
  }
}

export default Metronome;