import React from 'react';
import './button.css';

function Button(props) {
  const label = props.label;
  let className = 'button';

  if (props.addClass) {
    className = `${className} ${props.addClass}`;
  }

  return (
    <button
      className={className}
      onClick={props.clickHandler}>
      {label}
    </button>
  );
}

export default Button;
