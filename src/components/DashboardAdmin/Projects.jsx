import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import './Projects.scss';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [newProject, setNewProject] = useState({
    project_name: '',
    start_date: '',
    end_date: '',
    status: '',
    description: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/project/listProject');
      setProjects(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
    }
  };

  const handleAddProject = async () => {
    try {
      await axios.post('http://localhost:8080/api/project/addProject', newProject);
      fetchProjects();
      setShowModal(false);
      resetProjectForm();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du projet:', error);
    }
  };

  const handleUpdateProject = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/project/updateProject/${id}`, newProject);
      fetchProjects();
      setShowModal(false);
      resetProjectForm();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/project/deleteProject/${projectToDelete}`);
      setProjects(projects.filter(project => project.project_id !== projectToDelete));
      setShowConfirmModal(false);
      setProjectToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmModal(false);
    setProjectToDelete(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filterProjects = () => {
    if (searchTerm) {
      setFilteredProjects(projects.filter(project =>
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } else {
      setFilteredProjects(projects);
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setCurrentProject(project);
      setNewProject({
        project_name: project.project_name,
        start_date: project.start_date,
        end_date: project.end_date,
        status: project.status,
        description: project.description
      });
      setIsEditing(true);
    } else {
      setCurrentProject(null);
      resetProjectForm();
      setIsEditing(false);
    }
    setShowModal(true);
  };

  const resetProjectForm = () => {
    setNewProject({
      project_name: '',
      start_date: '',
      end_date: '',
      status: '',
      description: ''
    });
  };

  return (
    <div className="projects-container">
      <div className="searchContainerPr">
        <input
          type="text"
          placeholder="Search project by name ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="searchBarPr"
        />
        <FaSearch className="searchIconPr" />
      </div>

      <table className="projects-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom du Projet</th>
            <th>Date de Début</th>
            <th>Date de Fin</th>
            <th>Status</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProjects.map((project) => (
            <tr key={project.project_id}>
              <td>{project.project_id}</td>
              <td>{project.project_name}</td>
              <td>{project.start_date}</td>
              <td>{project.end_date}</td>
              <td>{project.status}</td>
              <td>{project.description}</td>
              <td>
                <button className="editer-button" onClick={() => openModal(project)}>
                  <FaEdit />
                </button>
                <button className="supprimer-button" onClick={() => {
                  setProjectToDelete(project.project_id);
                  setShowConfirmModal(true);
                }}>
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <br />
      <br />
      <button className="add-button" onClick={() => openModal()}>
        <FaPlus /> Add new project
      </button>

      {showModal && (
        <div className="modal-overlayProjects">
          <div className="modal-containerProjects">
            <h2>{currentProject ? 'Edit Project' : 'Add Project'}</h2>
            <input
              type="text"
              name="project_name"
              placeholder="Nom du Projet"
              value={newProject.project_name}
              onChange={handleInputChange}
            />
            <input
              type="date"
              name="start_date"
              placeholder="Date de Début"
              value={newProject.start_date}
              onChange={handleInputChange}
            />
            <input
              type="date"
              name="end_date"
              placeholder="Date de Fin"
              value={newProject.end_date}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="status"
              placeholder="Status"
              value={newProject.status}
              onChange={handleInputChange}
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newProject.description}
              onChange={handleInputChange}
            />
            <button className='confirmer-btnProjects' onClick={currentProject ? () => handleUpdateProject(currentProject.project_id) : handleAddProject}>
              {currentProject ? 'Save Changes' : 'Add Project'}
            </button>
            <button className='cancelModifier'
            onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-overlayProjects">
          <div className="modal-containerProjects">
            <h3>Are you sure you want to delete this project?</h3>
            <div className="modal-buttonsProjects">
              <button onClick={handleDeleteConfirm} className="confirm-btnProjects">Delete</button>
              <button onClick={handleDeleteCancel} className="cancel-btnProjects">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
