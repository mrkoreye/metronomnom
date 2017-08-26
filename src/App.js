import React, { Component } from 'react';
import Button from './components/button/button'
import Cookie from './components/cookie/cookie'
import './App.css';

const Howl = require('howler').Howl;
const click1 = new Howl({
  src: ['click.mp3']
});
const click2 = new Howl({
  src: ['click-2.mp3']
});

class App extends Component {
  initialCookieSrc = 'cookie-0.png'

  constructor(props) {
    super(props);
    this.toggleMetronome = this.toggleMetronome.bind(this);
    this.state = {
      metronomeOn: false,
      metronomeId: null,
      bpm: 120,
      currentCookieImage: 0,
      cookieSrc: this.initialCookieSrc,
      selectedTone: 1,
    }

    // Bind functions to this instance of the App component
    this.toggleMetronome = this.toggleMetronome.bind(this);
    this.decreaseBpm = this.decreaseBpm.bind(this);
    this.increaseBpm = this.increaseBpm.bind(this);
    this.toggleSound = this.toggleSound.bind(this);
  }

  toggleMetronome() {
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
      cookieSrc: `cookie-${nextImage}.png`,
    });
  }

  startMetronome() {
    const timing = 60000 / this.state.bpm;
    let firstClick = true;

    const metronomeId = setInterval(() => {
      if (firstClick) {
        firstClick = false;
      } else {
        this.incrementCookieImage();
      }

      if (this.state.selectedTone === 1) {
        click1.play();
      } else {
        click2.play();
      }
      
    }, timing);

    this.setState({
      metronomeOn: !this.state.metronomeOn,
      metronomeId: metronomeId
    });
  }

  stopMetronome() {
    clearInterval(this.state.metronomeId);

    this.setState({
      metronomeOn: !this.state.metronomeOn,
      metronomeId: null,
      currentCookieImage: 0,
      cookieSrc: this.initialCookieSrc,
    });
  }

  decreaseBpm() {
    const bpm = this.state.bpm - 1;
    this.changeBpm(bpm);
  }

  increaseBpm() {
    const bpm = this.state.bpm + 1;
    this.changeBpm(bpm);
  }

  changeBpm(newBpm) {
    this.stopMetronome();

    this.setState({
      bpm: newBpm
    });
  }

  toggleSound() {
    const newTone = this.state.selectedTone === 1 ? 2 : 1;
    this.setState({
      selectedTone: newTone
    });
  }

  render() {
    return (
      <div className="main-container">
        <div className="app-header">
          <h2>Metronomnom</h2>
          <Cookie
            src={this.state.cookieSrc} />
          <h4>BPM: {this.state.bpm}</h4>
          <Button
            label="Toggle On / Off" 
            addClass="toggle large"
            clickHandler={this.toggleMetronome} />
          <Button
            label='Slower'
            clickHandler={this.decreaseBpm} />
          <Button
            label='Faster'
            clickHandler={this.increaseBpm} />
          <Button
            label='Change Sound'
            clickHandler={this.toggleSound} />
        </div>
      </div>
    );
  }
}

export default App;
