import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-section">
      <div className="about">
        <h1>About Us</h1>
        <p>
          Welcome to Project-Together! We are a team dedicated to helping you collaborate and manage your projects efficiently. Our platform provides tools and resources for project management, task tracking, and team collaboration.
        </p>
        <p>
          Our mission is to help you achieve more together by providing a seamless and intuitive platform for project collaboration.
        </p>
      </div>

      <div className="collaboration-management">
        <h1>Internship and Collaborative Projects Management</h1>
        <p>
          At Project-Together, we offer specialized tools to manage internships and collaborative projects. Our platform enables seamless tracking of intern progress, project milestones, and team collaboration.
        </p>
        <p>
          Whether you are an intern or a project manager, our resources are designed to facilitate efficient communication and task management, ensuring successful project outcomes.
        </p>
      </div>
    </div>
  );
};

export default About;
