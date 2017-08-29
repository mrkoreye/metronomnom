import React, {Component} from 'react';
import './button.css';

class Button extends Component {
  constructor(props) {
    super(props);

    this.state = {
      clicked: false,
    };
  }

  clickHandler = () => {
    if (this.props.noClick) {
      return;
    }

    if (!this.props.noClickAnim) {
      this.setState({
        clicked: true,
      });
  
      setTimeout(() => {
        this.setState({
          clicked: false,
        })
      }, 150)
    }

    this.props.clickHandler();
  }

  render() {
    return (
      <button
        className={`button ${this.props.addClass} ` + (this.state.clicked ? 'clicked' : '')}
        onClick={this.clickHandler}>
        {this.props.label}
      </button>
    );
  }
}

export default Button;
