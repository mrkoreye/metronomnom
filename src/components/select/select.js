import React, { Component } from 'react';
import Button from '../button/button';
import './select.css';

class Select extends Component {
  constructor(props) {
    super(props);
    this.state = {
      overlayActive: false,
    }
  }

  toggleOverlay = () => {
    const newOverlayState = !this.state.overlayActive;
    this.setState({
      overlayActive: newOverlayState,
    });
  }

  selectValue = (value) => {
    this.toggleOverlay();
    this.props.clickHandler(value);
  }

  selectOverlayItem(value) {
    return (
      <div
        key={value}
        onClick={() => this.selectValue(value)}
        className="select-item">
        {value}
      </div>
    );
  }

  render() {
    const values = this.props.values.map((value) => {
      return this.selectOverlayItem(value);
    });

    const overlayClassName = 'select-overlay' + 
      (this.state.overlayActive ? ' active' : '');
    
    const valueClassName = 'select-value' +
      (this.props.borderBottom ? ' border-bottom' : '');

    return (
      <div
        className="select-container">
        <div
          className={overlayClassName}>
          {values}
        </div>
        <Button
          addClass={valueClassName}
          label={this.props.selectedValue}
          clickHandler={this.toggleOverlay} />
      </div>
    )
  }
}

export default Select;
