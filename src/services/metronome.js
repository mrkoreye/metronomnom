import BufferLoader from './buffer-loader.js';

const DEFAULT_BPM = 120;
const DEFAULT_VOLUME = 0.7;
const VOLUME_CHANGE_INCREMENT = 0.1;
const ACCENT_NOTE_PLAYBACK_VALUE = 1.1;
const DEFAULT_BEATS_PER_BAR = 4;
// 4 is for quarter note, 8 is for 8th note, 16 is for 16th note
const DEFAULT_NOTE_VALUE_FOR_BEAT = 4;
// Limit to only quarter, eighth, and sixteen notes. Get your irrational time signature out of here! :P
const ALLOWED_NOTE_VALUES_FOR_BEAT = [4, 8, 16];
// in milliseconds
const INTERVAL_FOR_TIME_CHECK = 25;
// in seconds
const SCHEDULE_AHEAD_TIME = 0.1;
// tap tempo in seconds
const TIME_UNTIL_TAP_TEMPO_RESET = 3;
const TAPS_NEEDED_TO_CALCULATE_BPM = 4;
const MAX_TAP_BPM = 300;

// Setup global AudioContext variable for different browsers
window.AudioContext = window.AudioContext || window.webkitAudioContext;

// The timing aspect of this metronome is inspired by:
// https://github.com/cwilso/metronome/blob/master/js/metronome.js
class Metronome {
  _bpm = DEFAULT_BPM;
  _currentNoteInBar = 0;
  _timeCheckIntervalId = null;
  _clickBuffers = [];
  _nextNoteTime = 0.0;
  _clickType = 3;
  _accentFirstBeat = false;
  _clickGainNode = null;
  _audioContext = null;
  _isOn = false;
  _beatsPerBar = DEFAULT_BEATS_PER_BAR;
  _noteValueForBeat = DEFAULT_NOTE_VALUE_FOR_BEAT;
  _lastTapTime = 0;
  _currentTapValues = []; 

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
    this._currentNoteInBar = 0;
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

  currentNoteInBar() {
    return this._currentNoteInBar;
  }

  clickType(cycleClick) {
    if (cycleClick) {
      const nextClickType = (this._clickType + 1) % this._clickBuffers.length;
      this._clickType = nextClickType;
    }

    return this._clickType;
  }

  tapTempo() {
    const currentTime = this._audioContext.currentTime;

    // Reset tapping history every few seconds
    if ((currentTime - this._lastTapTime) > TIME_UNTIL_TAP_TEMPO_RESET) {
      this._currentTapValues = [];
    }

    this._currentTapValues.push(currentTime);
    this._lastTapTime = currentTime;
    this.updateBpmFromTap();
  }

  updateBpmFromTap() {
    // return unless there are enough taps to take an average
    if (this._currentTapValues.length < TAPS_NEEDED_TO_CALCULATE_BPM) {
      return;
    }

    const tapDifferences = [];
    this._currentTapValues.forEach((time, index, tapValues) => {
      const nextTapTime = tapValues[index + 1];
      let difference;

      if (nextTapTime) {
        difference = nextTapTime - time;
        tapDifferences.push(difference);
      }
    });

    const secondsPerBeatFromTapAverages = tapDifferences.reduce((accumulator, currentValue) => {
      return (accumulator + currentValue) / 2;
    });

    const possibleNewBpm = 60.0 / secondsPerBeatFromTapAverages;
    this._bpm = Math.min(Math.round(possibleNewBpm), MAX_TAP_BPM);
  }

  accentFirstBeat(toggle) {
    if (toggle) {
      this._accentFirstBeat = !this._accentFirstBeat;
    }

    return this._accentFirstBeat;
  }

  beatsPerBar(beatsPerBar) {
    if (beatsPerBar) {
      this._beatsPerBar = beatsPerBar;
    }

    return this._beatsPerBar;
  }

  noteValueForBeat(noteValueForBeat) {
    const shouldSetNewValueForBeat = noteValueForBeat && 
      ALLOWED_NOTE_VALUES_FOR_BEAT.indexOf(noteValueForBeat) !== -1;
    
    if (shouldSetNewValueForBeat) {
      this._noteValueForBeat = noteValueForBeat;
    }

    return this._noteValueForBeat;
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
      this._scheduleNote(this._currentNoteInBar, this._nextNoteTime, onNoteClick);
      this._advanceCurrentNote();
      loopCount++;
    }
  }

  _scheduleNote = (beatNumber, time, onNoteClick) => {
    const firstBeatOfBar = beatNumber === 0;
    const shouldAccentNote = (firstBeatOfBar && this._accentFirstBeat);
    const click = this._generateClickSource(this._clickType);

    if (shouldAccentNote) {
      click.playbackRate.value = ACCENT_NOTE_PLAYBACK_VALUE;
    }

    click.start(time);

    if (onNoteClick) {
      // Call the callback passed in when metronome was started at the 
      // *approx* same time as when click will happen
      setTimeout(() => {
        onNoteClick(firstBeatOfBar, beatNumber)
      }, time - this._audioContext.currentTime);
    }
  }

  _advanceCurrentNote = () => {
    const secondsPerBeat = 60.0 / this._bpm;
    this._nextNoteTime += (4 / this._noteValueForBeat) * secondsPerBeat;
    this._currentNoteInBar = (this._currentNoteInBar + 1) % this._beatsPerBar;
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