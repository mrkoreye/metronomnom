import React from 'react';
import './cookie.css';

function Cookie(props) {
  const className = `cookie-image`;

  return (
    <img
      src={'images/' + props.src}
      alt={props.src}
      className={className} />
  );
}

export default Cookie;
