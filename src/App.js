import React, { Component } from 'react';
import Button from './components/button/button'
import Cookie from './components/cookie/cookie'
import Slider from 'rc-slider';
import BufferLoader from './buffer-loader.js';

import 'rc-slider/assets/index.css';
import './App.css';

const DEFAULT_BPM = 120;
const DEFAULT_VOLUME = 0.7;
const VOLUME_CHANGE_INCREMENT = 0.1;
const DEFAULT_NOTE_RESOLUTION = 4;
const MIN_BPM = 20;
const MAX_BPM = 220;
const ACCENT_NOTE_PLAYBACK_VALUE = 1.1;
// Break each loop/measure up into 16 notes
const LAST_NOTE_OF_BAR = 16;
// in milliseconds
const INTERVAL_FOR_TIME_CHECK = 25;
// in seconds
const SCHEDULE_AHEAD_TIME = 0.1;

// const Howl = require('howler').Howl;
const Handle = Slider.Handle;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
// The gain node is used to control volume
const clickGainNode = audioContext.createGain();
clickGainNode.connect(audioContext.destination);

// The timing aspect of this metronome is a slightly modified version of:
// https://github.com/cwilso/metronome/blob/master/js/metronome.js
class App extends Component {
  current16thNoteInBar = 0;
  notesInQueue = [];
  timeCheckIntervalId = null;
  currentVolume = DEFAULT_VOLUME;
  clickBuffers = [];
  nextNoteTime = 0.0;
  lastBeatDrawn = 0;

  constructor(props) {
    super(props);
    this.toggleMetronome = this.toggleMetronome.bind(this);
    this.state = {
      metronomeOn: false,
      bpm: DEFAULT_BPM,
      currentCookieImage: 0,
      currentClickType: 3,
      noteResolution: DEFAULT_NOTE_RESOLUTION,
      accentFirstBeat: false,
    }

    this.loadClickAudio();
  }

  loadClickAudio() {
    const audioCLickFileList = [
      'clicks/click-0.mp3',
      'clicks/click-1.mp3',
      'clicks/click-2.mp3',
      'clicks/click-3.mp3',
    ];

    const bufferLoader = new BufferLoader(
      audioContext,
      audioCLickFileList,
      this.initClickAudio
    );
  
    bufferLoader.load();
  }

  initClickAudio = (bufferList) => {
    for (let index = 0; index < bufferList.length; index++) {
      const buffer = bufferList[index];
      this.clickBuffers.push(buffer);
    }
  }

  generateClickSource(clickNumber) {
    const newSource = audioContext.createBufferSource();
    const buffer = this.clickBuffers[clickNumber];

    if (buffer) {
      newSource.buffer = buffer;
      newSource.connect(clickGainNode);
      return newSource;
    } else {
      return null;
    }
  }

  toggleMetronome = () => {
    if (this.state.metronomeOn) {
      this.stopMetronome();
    } else {
      this.startMetronome();
    }
  }

  incrementCookieImage = () => {
    const numCookieImages = 4;
    const currentCookieImage = this.state.currentCookieImage;
    const nextImage = (currentCookieImage + 1) % numCookieImages;

    this.setState({
      currentCookieImage: nextImage,
    });
  }

  scheduleClick = () => {
    while (this.nextNoteTime < audioContext.currentTime + SCHEDULE_AHEAD_TIME) {
      this.scheduleNote(this.current16thNoteInBar, this.nextNoteTime);
      this.advanceCurrentNote();
    }
  }

  scheduleNote(beatNumber, time) {
    this.notesInQueue.push({
      note: beatNumber, time: time
    });

    // Don't play every 16th beat when we only want 8ths or 4ths
    const shouldPlayBeat = !(beatNumber % (LAST_NOTE_OF_BAR / this.state.noteResolution));

    if (shouldPlayBeat) {
      const shouldAccentNote = beatNumber === 0 && this.state.accentFirstBeat;
      const click = this.generateClickSource(this.state.currentClickType);

      if (shouldAccentNote) {
        click.playbackRate.value = ACCENT_NOTE_PLAYBACK_VALUE;
      }

      click.start(time);
      setTimeout(this.incrementCookieImage, time - audioContext.currentTime)
    }
  }

  advanceCurrentNote() {
    const secondsPerBeat = 60.0 / this.state.bpm;
    // 0.25 converts quarter note to 16th note
    this.nextNoteTime += 0.25 * secondsPerBeat;
    this.current16thNoteInBar = (this.current16thNoteInBar + 1) % LAST_NOTE_OF_BAR;
  }

  startMetronome = () => {
    this.current16thNoteInBar = 0;
    this.nextNoteTime = audioContext.currentTime;
    this.timeCheckIntervalId = setInterval(this.scheduleClick, INTERVAL_FOR_TIME_CHECK);

    this.setState({
      metronomeOn: true
    });
  }

  stopMetronome = () => {
    clearInterval(this.timeCheckIntervalId);

    this.setState({
      metronomeOn: false,
      currentCookieImage: 0,
    });
  }

  setBpm(newBpm) {
    this.setState({
      bpm: newBpm
    });
  }

  onBpmSliderChange = (bpm) => {
    this.setBpm(bpm);
  }

  restartMetronome = () => {
    if (this.state.metronomeOn) {
      this.stopMetronome();
      this.startMetronome();
    }
  }

  increaseVolume = () => {
    const currentVolume = this.currentVolume;

    if (currentVolume === 1) {
      return;
    } else {
      clickGainNode.gain.value = this.currentVolume = currentVolume + VOLUME_CHANGE_INCREMENT;
    }
  }

  decreaseVolume = () => {
    const currentVolume = this.currentVolume;

    if (currentVolume === 0) {
      return;
    } else {
      clickGainNode.gain.value = this.currentVolume = currentVolume - VOLUME_CHANGE_INCREMENT;
    }
  }

  nextClickType = () => {
    const currentClick = this.state.currentClickType;
    const nextClickInstance = (currentClick + 1) % this.clickBuffers.length;

    this.setState({
      currentClickType: nextClickInstance,
    });
  }

  previousClickType = () => {
    const currentClick = this.state.currentClickType;
    const nextClickInstance = (currentClick - 1) >= 0 ? currentClick - 1 :  this.clickBuffers.length - 1;

    this.setState({
      currentClickType: nextClickInstance,
    });
  }

  setNoteResolution = (resolution) => {
    const currentNoteResolution = this.state.noteResolution;

    if (resolution && resolution !== currentNoteResolution) {
      this.setState({
        noteResolution: resolution
      });
    }
  }

  toggleAccentFirstBeat = () => {
    const accentBeat = this.state.accentFirstBeat;
    this.setState({
      accentFirstBeat: !accentBeat
    });
  }

  handleEl = (props) => {
    const { value, dragging, index, className, ...restProps } = props;
    
    return (
      <Handle
        className={className + ' fa fa-cutlery'}
        value={value} 
        {...restProps} />
    )
  }

  render() {
    return (
      <div className="main-container">
        <div className="app-header">
          <Cookie
            metronomeActive={this.state.metronomeOn}
            currentImg={this.state.currentCookieImage} />
          <h2>{this.state.bpm} bpm</h2>
          <Slider 
            min={MIN_BPM}
            max={MAX_BPM}
            value={this.state.bpm}
            handle={this.handleEl}
            onChange={this.onBpmSliderChange}
            onAfterChange={this.restartMetronome}/>
          <div className="button-container">
            <Button
              noClickAnim={true}
              addClass={'no-transition fa fa-' + (this.state.metronomeOn ? 'stop' : 'play')} 
              clickHandler={this.toggleMetronome} />
            <Button
              addClass="fa fa-volume-down"
              clickHandler={this.decreaseVolume} />
            <Button
              addClass="fa fa-volume-up"
              clickHandler={this.increaseVolume} />
          </div>
          <div className="button-container">
            <Button
              addClass="fa fa-arrow-left"
              clickHandler={this.previousClickType} />
            <Button
              noClick={true}
              addClass={'click-' + this.state.currentClickType + ' click-bell fa fa-bell'} />
            <Button
              addClass="fa fa-arrow-right"
              clickHandler={this.nextClickType} />
          </div>
          <div className="button-container">
            <Button
              addClass={'no-transition fa fa-bomb ' + (this.state.accentFirstBeat ? 'active' : '')} 
              clickHandler={this.toggleAccentFirstBeat} />
            <Button
              addClass={'fa fa-hand-peace-o ' + (this.state.noteResolution === 4 ? 'active' : '')} 
              clickHandler={() => this.setNoteResolution(4)} />
            <Button
              addClass={'fa fa-hand-spock-o ' + (this.state.noteResolution === 8 ? 'active' : '')} 
              clickHandler={() => this.setNoteResolution(8)} />
          </div>
          <h1>Metronomnom</h1>
        </div>
      </div>
    );
  }
}

export default App;
