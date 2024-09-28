import React, { useEffect, useState } from "react";
import Background from '../Background/Background';
import Navbar from "../Navbar/Navbar";
import Hero from "../Hero/Hero";
import About from "../About/About";
import Contact from "../Contact/Contact";
import Features from "../Features/Features";

const Accueil = () => {
  let heroData = [
    { text1: "Collaborate on", text2: "your projects" },
    { text1: "Manage tasks", text2: "efficiently" },
    { text1: "Achieve more", text2: "together" },
  ];

  const [heroCount, setHeroCount] = useState(2);
  const [playStatus, setPlayStatus] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroCount((count) => (count === 2 ? 0 : count + 1));
    }, 3000);
    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, []);

  return (
    <div>
      <Navbar />
      <Hero
        setPlayStatus={setPlayStatus}
        heroData={heroData[heroCount]}
        heroCount={heroCount}
        setHeroCount={setHeroCount}
        playStatus={playStatus}
      />
      <Background playStatus={playStatus} heroCount={heroCount} />
      <Features />
      <div id="about">
         <About />
      </div>
      
      <div id="contact">
         <Contact />
      </div>
    </div>
  );
}

export default Accueil;
