import React from 'react';
import './Welcome.scss';
import video from '../../assets/welcome4.mp4';

const Welcome = () => {
  return (
    <div className='welcome-container'>
      <video className='welcome-video' autoPlay muted loop>
        <source src={video} type='video/mp4' />
        Votre navigateur ne prend pas en charge les vidéos HTML5.
      </video>
      <div className='welcometext'>
        <p className='animatedtext'>Welcome Back Administrator...</p>
      </div>
    </div>
  );
};

export default Welcome;
