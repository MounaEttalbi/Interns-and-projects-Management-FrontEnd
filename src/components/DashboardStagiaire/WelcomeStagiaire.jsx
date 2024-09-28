import React from 'react';
import './WelcomeStagiaire.scss';
import video from '../../assets/welcome4.mp4'

const WelcomeStagiaire = () => {
  return (
    <div className='welcome-container'>
      <video className='welcome-video' autoPlay muted loop>
        <source src={video} type='video/mp4' />
        Votre navigateur ne prend pas en charge les vidéos HTML5.
      </video>
      <div className='welcome-text'>
          Welcome Back to Your Journey, Intern !
      </div>
    </div>
  );
};

export default WelcomeStagiaire;
