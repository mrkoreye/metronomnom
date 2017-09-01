import React, { Component } from 'react';
import './indicator-lights.css';

class IndicatorLights extends Component {
  indicatorLight = (lightStatus) => {
    const className = 'indicator-light' + 
      (lightStatus.accent ? ' accented' : '') + 
      (lightStatus.active ? ' active' : '');
    const lightStyle = {
      width: `${100 / this.props.numBeats}%`,
    };

    return (
      <div
        key={lightStatus.number}
        style={lightStyle}
        className={className}>
      </div>
    );
  }

  render() {
    const numLights = this.props.numBeats;
    const activeLight = this.props.activeLight;
    const indicatorLights = [];

    for (let lightNumber = 0; lightNumber < numLights; lightNumber++) {
      const lightStatus = {
        accent: this.props.metronomeActive && lightNumber === 0,
        active: this.props.metronomeActive && lightNumber === activeLight,
        number: lightNumber,
      };

      indicatorLights.push(this.indicatorLight(lightStatus));
    }

    return (
      <div
        className="indicator-lights-container">
        {indicatorLights}
      </div>
    );
  }
}

export default IndicatorLights;
