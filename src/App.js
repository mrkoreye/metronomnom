import React, { Component } from 'react';
import Button from './components/button/button';
import Cookie from './components/cookie/cookie';
import Metronome from './services/metronome';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';
import './App.css';

const Handle = Slider.Handle;
const MIN_BPM = 20;
const MAX_BPM = 220;

class App extends Component {
  metronome = null;

  constructor(props) {
    super(props);
    this.metronome = new Metronome();
    this.state = {
      metronomeOn: this.metronome.isOn(),
      bpm: this.metronome.bpm(),
      currentCookieImage: 0,
      currentClickType: this.metronome.clickType(),
      noteResolution: this.metronome.noteResolution(),
      accentFirstBeat: this.metronome.accentFirstBeat(),
    }
  }

  toggleMetronome = () => {
    if (this.metronome.isOn()) {
      this.stopMetronome();
    } else {
      this.startMetronome();
    }
  }

  startMetronome = () => {
    this.metronome.start(this.incrementCookieImage);
    this.setState({
      metronomeOn: this.metronome.isOn(),
    });
  }

  stopMetronome = () => {
    this.metronome.stop();
    this.setState({
      metronomeOn: this.metronome.isOn(),
      currentCookieImage: 0,
    });
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
    this.setState({
      bpm: this.metronome.bpm(),
    });
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
    this.setState({
      currentClickType: this.metronome.clickType(),
    });
  }

  setNoteResolution = (resolution) => {
    this.metronome.noteResolution(resolution);
    this.setState({
      noteResolution: this.metronome.noteResolution(),
    });
  }

  toggleAccentFirstBeat = () => {
    this.metronome.accentFirstBeat(true);
    this.setState({
      accentFirstBeat: this.metronome.accentFirstBeat(),
      inThree: this.metronome.isInThree() ? '3' : '',
    });
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
          </div>
          <div className="button-container">
            <Button
              clickHandler={this.changeClickType}
              addClass={'click-' + this.state.currentClickType + ' click-bell fa fa-bell'} />
            <Button
              addClass="fa fa-volume-down"
              clickHandler={this.decreaseVolume} />
            <Button
              addClass="fa fa-volume-up"
              clickHandler={this.increaseVolume} />
          </div>
          <div className="button-container">
            <Button
              addClass={'no-transition fa fa-bomb ' + (this.state.accentFirstBeat ? 'active' : '')} 
              label={this.state.inThree}
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
