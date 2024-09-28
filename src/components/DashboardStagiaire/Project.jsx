import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Project.scss';

const Project = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const email = sessionStorage.getItem('email');

    if (!email) {
      setError('No email found in sessionStorage.');
      setLoading(false);
      return;
    }
    try {
      const response = await axios.get(`http://localhost:8080/api/project/getByEmail?email=${email}`);
      setProjects(response.data ? [response.data] : []);
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
    }
  };

  return (
    <div className="projectsInterncontainer">
      <h1 className='titleprojIntern'>My Project's Information</h1>
      <div className="projectsInternlist">
        {projects.map((project) => (
          <div key={project.project_id} className="projectInterncard">
            <h2>{project.project_name}</h2>
            <p><strong>ID:</strong> {project.project_id}</p>
            <p><strong>Date de Début:</strong> {project.start_date}</p>
            <p><strong>Date de Fin:</strong> {project.end_date}</p>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Description:</strong> {project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Project;
