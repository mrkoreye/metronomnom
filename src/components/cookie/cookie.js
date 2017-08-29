import React, { Component } from 'react';
import './cookie.css';

class Cookie extends Component {
  cookieFilenameBase = 'images/cookie-X.png';
  cookieSrcs = null;
  currentImg = this.props.currentImg;
  
  constructor(props) {
    super(props);
    // Init the cookieSrcs property with the different filenames
    this.cookieSrcs = [0, 1, 2, 3].map((number) => {
      return {
        number: number,
        src: this.cookieFilenameBase.replace('X', number),
      };
    });

    // Iterate over the srcs and preload the images, so when metronome starts
    // for the first time hopefully it isn't super jittery
    this.cookieSrcs.forEach((cookieSrc) => {
      const dummyImageEl = new Image();
      dummyImageEl.src = cookieSrc.src;
    });
  }
  
  getImgElement(cookieSrc) {
    let className = 'cookie-image'

    if (this.props.currentImg === cookieSrc.number) {
      className += ' show';
    } 

    if (!this.props.metronomeActive) {
      className += ' metronome-inactive';
    } else {
      className += ' metronome-active';
    }

    return(
      <img
        key={cookieSrc.src}
        src={cookieSrc.src}
        alt={cookieSrc.src}
        className={className} />
    );
  }

  render() {
    const imgElements = this.cookieSrcs.map((cookieSrc) => {
      return this.getImgElement(cookieSrc);
    });

    return (
      <div className="cookie-image-container">
        {imgElements}
      </div>
    )
  }
}

export default Cookie;
