import React from 'react';
import ReactLoading from 'react-loading';


export const LoadingPage = () => {
  return (
    <div className="loader-wrapper sub-loader" style={{position: "fixed"}}>
      <span className="loader"><span className="loader-inner"></span></span>
    </div>
  )
};

export const fadeOut = (setHasLoading) => {
  var div = document.querySelector('.sub-loader')
  if (div) {
    var fadeOutEffect = setInterval(() => {
      if (!div.style.opacity) {
        div.style.opacity = 1;
      };

      if (div.style.opacity > 0) {
        div.style.opacity -= 0.05;
      } else {
        clearInterval(fadeOutEffect);
        setHasLoading(true);
      }
    }, 25)
  }
};

export const LoadingItem = (props) => {
  var sizes = props.size ? props.size : "64px"

  return <ReactLoading type="bars" style={{ fill: "#ffb535", height: sizes, width: sizes}} />
}