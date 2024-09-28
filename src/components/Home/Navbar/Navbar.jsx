import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '/src/components/Home/Navbar/Navbar.css';
import logo from '../../../assets/collaboration.png';

const Navbar = () => {
  const navigate = useNavigate();
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const [hidden, setHidden] = useState(false);

  const handleSignInClick = () => {
    navigate('/login');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > lastScrollTop) {
        // Scrolling down
        setHidden(true);
      } else {
        // Scrolling up
        setHidden(false);
      }

      setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollTop]);

  return (
    <header className={`header ${hidden ? 'hidden' : ''}`}>
      <div className="nav">
        <div className="nav-logo">
          <img src={logo} alt="Project-Together Logo" />
          <span>Project-Together</span>
        </div>
        <ul className="nav-menu">
          <li>
            <a href="#home" onClick={scrollToTop}>Home</a>
          </li>
          <li>
            <a href="#about">About us</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
          <li className="nav-cnx" onClick={handleSignInClick}>Sign in</li>
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
