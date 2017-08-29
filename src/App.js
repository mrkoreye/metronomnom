import React, { Component } from 'react';
import Button from './components/button/button'
import Cookie from './components/cookie/cookie'
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';
import './App.css';

const DEFAULT_BPM = 120;
const DEFAULT_VOLUME = 0.7;
const MIN_BPM = 20;
const MAX_BPM = 220;

const Howl = require('howler').Howl;
const Handle = Slider.Handle;

class App extends Component {
  clicks = [
    new Howl({
      src: ['clicks/click-0.mp3'],
      volume: DEFAULT_VOLUME,
    }),
    new Howl({
      src: ['clicks/click-1.mp3'],
      volume: DEFAULT_VOLUME,
    }),
    new Howl({
      src: ['clicks/click-2.mp3'],
      volume: DEFAULT_VOLUME,
    }),
    new Howl({
      src: ['clicks/click-3.mp3'],
      volume: DEFAULT_VOLUME,
    }),
  ];

  constructor(props) {
    super(props);
    this.toggleMetronome = this.toggleMetronome.bind(this);
    this.state = {
      metronomeOn: false,
      metronomeId: null,
      bpm: DEFAULT_BPM,
      currentCookieImage: 0,
      currentClickInstance: 3,
    }

    // Bind functions to this instance of the App component
    this.decreaseBpm = this.decreaseBpm.bind(this);
    this.increaseBpm = this.increaseBpm.bind(this);
    this.restartMetronome = this.restartMetronome.bind(this);
    this.increaseVolume = this.increaseVolume.bind(this);
    this.decreaseVolume = this.decreaseVolume.bind(this);
  }

  toggleMetronome = () => {
    if (this.state.metronomeOn) {
      this.stopMetronome();
    } else {
      this.startMetronome();
    }
  }

  incrementCookieImage() {
    const numCookieImages = 4;
    const currentCookieImage = this.state.currentCookieImage;
    const nextImage = (currentCookieImage + 1) % numCookieImages;

    this.setState({
      currentCookieImage: nextImage,
    });
  }

  startMetronome() {
    const timing = 60000 / this.state.bpm;

    const metronomeId = setInterval(() => {
      this.incrementCookieImage();
      this.clicks[this.state.currentClickInstance].play();
    }, timing);

    this.setState({
      metronomeOn: true,
      metronomeId: metronomeId
    }, () => this.clicks[this.state.currentClickInstance].play());
  }

  stopMetronome() {
    clearInterval(this.state.metronomeId);

    this.setState({
      metronomeOn: false,
      metronomeId: null,
      currentCookieImage: 0,
    });
  }

  decreaseBpm() {
    const bpm = this.state.bpm - 1;
    this.setBpm(bpm);
  }

  increaseBpm() {
    const bpm = this.state.bpm + 1;
    this.setBpm(bpm);
  }

  setBpm(newBpm) {
    this.setState({
      bpm: newBpm
    });
  }

  onBpmSliderChange = (bpm) => {
    this.setBpm(bpm);
  }

  restartMetronome() {
    this.stopMetronome();
    this.startMetronome();
  }

  increaseVolume() {
    const currentVolume = this.clicks[this.state.currentClickInstance].volume();

    if (currentVolume === 1) {
      return;
    } else {
      this.clicks[this.state.currentClickInstance].volume(currentVolume + 0.1);
    }
  }

  decreaseVolume() {
    const currentVolume = this.clicks[this.state.currentClickInstance].volume();

    if (currentVolume === 0) {
      return;
    } else {
      this.clicks[this.state.currentClickInstance].volume(currentVolume - 0.1);
    }
  }

  nextClickType = () => {
    const currentClick = this.state.currentClickInstance;
    const nextClickInstance = (currentClick + 1) % this.clicks.length;
    console.log(nextClickInstance);
    this.setState({
      currentClickInstance: nextClickInstance,
    });
  }

  previousClickType = () => {
    const currentClick = this.state.currentClickInstance;
    const nextClickInstance = (currentClick - 1) >= 0 ? currentClick - 1 :  this.clicks.length - 1;
    console.log(nextClickInstance);
    this.setState({
      currentClickInstance: nextClickInstance,
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
              addClass={'fa fa-' + (this.state.metronomeOn ? 'stop' : 'play')} 
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
              addClass={'click-' + this.state.currentClickInstance + ' click-bell fa fa-bell'} />
            <Button
              addClass="fa fa-arrow-right"
              clickHandler={this.nextClickType} />
          </div>
          <h1>Metronomnom</h1>
        </div>
      </div>
    );
  }
}

export default App;
