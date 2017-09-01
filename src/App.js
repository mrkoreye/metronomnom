import 'rc-slider/assets/index.css';
import 'react-select/dist/react-select.css';
import './App.css';

import React, { Component } from 'react';
import Button from './components/button/button';
import Cookie from './components/cookie/cookie';
import Metronome from './services/metronome';
import Slider from 'rc-slider';
import Select from 'react-select';
import IndicatorLights from './components/indicator-lights/indicator-lights';

const Handle = Slider.Handle;
const MIN_BPM = 20;
const MAX_BPM = 220;

class App extends Component {
  metronome = null;

  constructor(props) {
    super(props);
    this.metronome = new Metronome();
    this.state = {
      ...this.getMetronomeState(),
      currentCookieImage: 0,
      activeBeat: 0,
      firstClick: true,
    };
  }

  toggleMetronome = () => {
    if (this.metronome.isOn()) {
      this.stopMetronome();
    } else {
      this.startMetronome();
    }
  }

  startMetronome = () => {
    this.metronome.start(this.updateClickUiProgression);
    this.updateMetronomeState();
    this.setState({
      currentCookieImage: 0,
      firstClick: true,
    });
  }

  stopMetronome = () => {
    this.metronome.stop();
    this.updateMetronomeState();
  }

  updateClickUiProgression = (firstBeatOfBar, currentBeat) => {
    this.setState({
      activeBeat: currentBeat,
    });

    if (firstBeatOfBar && !this.state.firstClick) {
      this.incrementCookieImage();
    } else {
      this.setState({
        firstClick: false,
      })
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

  setBpm(newBpm) {
    this.metronome.bpm(newBpm);
    this.updateMetronomeState();
  }

  onBpmSliderChange = (bpm) => {
    this.setBpm(bpm);
  }

  restartMetronome = () => {
    if (this.metronome.isOn) {
      this.stopMetronome();
      this.startMetronome();
    }
  }

  increaseVolume = () => {
    this.metronome.increaseVolume();
  }

  decreaseVolume = () => {
    this.metronome.decreaseVolume();
  }

  changeClickType = () => {
    this.metronome.clickType(true);
    this.updateMetronomeState();
  }

  toggleAccentFirstBeat = () => {
    this.metronome.accentFirstBeat(true);
    this.updateMetronomeState();
  }

  updateMetronomeState() {
    this.setState(this.getMetronomeState());
  }

  getMetronomeState() {
    return {
      metronomeOn: this.metronome.isOn(),
      bpm: this.metronome.bpm(),
      currentClickType: this.metronome.clickType(),
      accentFirstBeat: this.metronome.accentFirstBeat(),
      numBeats: this.metronome.beatsPerBar(),
      noteValueForBeat: this.metronome.noteValueForBeat(),
    };
  }

  tap = () => {
    this.metronome.tapTempo();
    this.updateMetronomeState();
  }

  setNoteValueForBeat = (newNoteValue) => {
    this.metronome.noteValueForBeat(newNoteValue.value);
    this.updateMetronomeState();
  }

  setBeatsPerBar = (newBeats) => {
    this.metronome.beatsPerBar(newBeats.value);
    this.updateMetronomeState();
  }

  noteValueForBeatOptions() {
    return [
      {
        value: 4,
        label: 4,
      },
      {
        value: 8,
        label: 8,
      },
      {
        value: 16,
        label: 16,
      },
    ]
  }

  beatsPerBarOptions() {
    const options = [];

    // Allow the choices of 1 through 16 for beats per bar
    for (let option = 1; option < 17; option++) {
      options.push({
        value: option,
        label: option,
      });
    }

    return options;
  }

  handleEl(props) {
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
        <h1>Metronomnom</h1>
        <Cookie
          metronomeActive={this.state.metronomeOn}
          currentImg={this.state.currentCookieImage} />
        <IndicatorLights
          metronomeActive={this.state.metronomeOn}
          activeLight={this.state.activeBeat}
          numBeats={this.state.numBeats} />
        {/* &#9833; is the hex code for a quarter note */}
        <h2>&#9833; = {this.state.bpm}</h2>
        <Slider 
          min={MIN_BPM}
          max={MAX_BPM}
          value={this.state.bpm}
          handle={this.handleEl}
          onChange={this.onBpmSliderChange} />
        <div className="button-container">
          <Button
            noClickAnim={true}
            addClass={'no-transition fa fa-' + (this.state.metronomeOn ? 'stop' : 'play')} 
            clickHandler={this.toggleMetronome} />
          <Button
            addClass="tap-tempo-button"
            label="Tap Tempo"
            clickHandler={this.tap} />
        </div>
        <div className="button-container">
          <Button
            addClass={'no-transition fa fa-bomb ' + (this.state.accentFirstBeat ? 'active' : '')} 
            clickHandler={this.toggleAccentFirstBeat} />
          <Select
            name="number-of-beats"
            className="beats-per-bar"
            value={this.state.numBeats}
            options={this.beatsPerBarOptions()}
            clearable={false}
            searchable={false}
            onChange={this.setBeatsPerBar} />
          <Button
            clickHandler={this.changeClickType}
            addClass={'click-' + this.state.currentClickType + ' click-bell fa fa-bell'} />
        </div>
        <div className="button-container">
          <Button
            addClass="fa fa-volume-down"
            clickHandler={this.decreaseVolume} />
          <Select
            name="note-value-for-beat"
            className="note-value-for-beat"
            value={this.state.noteValueForBeat}
            options={this.noteValueForBeatOptions()}
            clearable={false}
            searchable={false}
            onChange={this.setNoteValueForBeat} />
          <Button
            addClass="fa fa-volume-up"
            clickHandler={this.increaseVolume} />
        </div>
        <div
          className="link-container">
          <a 
            className="fa fa-github"
            href="https://github.com/mrkoreye/metronomnom">
          </a>
        </div>
      </div>
    );
  }
}

export default App;
