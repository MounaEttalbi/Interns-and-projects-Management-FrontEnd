import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaArrowRight, FaTimes } from 'react-icons/fa';
import './MyProjects.scss';

const MyProjects = () => {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [newProject, setNewProject] = useState({
    project_name: '',
    start_date: '',
    end_date: '',
    status: '',
    description: ''
  });

  useEffect(() => {
    fetchTeams();
    fetchProjects();
  }, []);

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
      await axios.post('http://localhost:8080/api/project/register', newProject);
      fetchProjects();
      setNewProject({
        project_name: '',
        start_date: '',
        end_date: '',
        status: '',
        description: ''
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du projet:', error);
    }
  };

  const handleUpdateProject = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/project/update/${id}`, newProject);
      fetchProjects();
      setCurrentProject(null);
      setNewProject({
        project_name: '',
        start_date: '',
        end_date: '',
        status: '',
        description: ''
      });
      setShowEditModal(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du projet:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/project/delete/${id}`);
      fetchProjects();
    } catch (error) {
      console.error('Erreur lors de la suppression du projet:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchTeams = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const email = sessionStorage.getItem('email');

      if (!token || !email) {
        throw new Error("Token or email not available");
      }

      console.log('Fetching teams with email:', email, 'and token:', token);

      const response = await axios.get(`http://localhost:8080/api/employee/getTeam/${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setTeams(response.data);
    } catch (err) {
      console.error("Error fetching teams:", err.response ? err.response.data : err.message);
    }
  };

  const handleAssignProject = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token || !selectedTeam || !selectedProject) {
        throw new Error("Missing required information.");
      }

      const teamId = parseInt(selectedTeam, 10);
      const projectId = parseInt(selectedProject, 10);

      if (isNaN(teamId) || isNaN(projectId)) {
        throw new Error("Invalid team or project ID.");
      }

      console.log(`Sending request with teamId: ${teamId} and projectId: ${projectId}`);

      const response = await axios.post(
        `http://localhost:8080/api/project/${projectId}/teams/${teamId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.status === 200) {
        alert('Project assigned successfully!');
        await fetchTeams();
        await fetchProjects();
        setShowForm(false);
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
    } catch (err) {
      console.error("Error assigning project:", err.response ? err.response.data : err.message);
      const errorMessage = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message || "An unknown error occurred.";
      alert(`Failed to assign project. ${errorMessage}`);
    }
  };

  const openEditModal = (project) => {
    setCurrentProject(project);
    setNewProject({
      project_name: project.project_name,
      start_date: project.start_date,
      end_date: project.end_date,
      status: project.status,
      description: project.description
    });
    setShowEditModal(true);
  };

  return (
    <div className="projects-container">
      <h1 className='titleproj'>Projects</h1>
      <div>
        <div className="assign-project-toggle" onClick={() => setShowForm(!showForm)}>
          <FaArrowRight className="toggle-icon" />
          <h2>Assign Project to Team</h2>
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
              <th>Teams</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.project_id}>
                <td>{project.project_id}</td>
                <td>{project.project_name}</td>
                <td>{project.start_date}</td>
                <td>{project.end_date}</td>
                <td>{project.status}</td>
                <td>{project.description}</td>
                <td>
                  {project.teams.length > 0 ? (
                    <table className="teams-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                        </tr>
                      </thead>
                      <tbody>
                        {project.teams.map((team) => (
                          <tr key={team.id}>
                            <td>{team.id}</td>
                            <td>{team.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No Teams</p>
                  )}
                </td>
                <td>
                  <button className='actionbuttonEmployeee' onClick={() => openEditModal(project)}>
                    <FaEdit className='actionbuttonEmployeee' />
                  </button>
                  <button className='deletebuttonEmployeee' onClick={() => handleDeleteProject(project.project_id)}>
                    <FaTrash  className='deletebuttonEmployeee'/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <br />
        <button className="AddNewProjectE" id='add-button' onClick={() => setIsEditing(true)}>
          <FaPlus /> Add new project
        </button>
        {/* Formulaire d'assignation de projet */}
        {showForm && (
  <div className="assign-project-overlay">
    <div className="assign-project-container">
      <h2>Assign Project to Team</h2>
      <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
        <option value="">Select Team</option>
        {teams.map(team => (
          <option key={team.id} value={team.id}>{team.name}</option>
        ))}
      </select>
      <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}>
        <option value="">Select Project</option>
        {projects.map(project => (
          <option key={project.project_id} value={project.project_id}>{project.project_name}</option>
        ))}
      </select>
      <button id='AssignProjectBtn33'onClick={handleAssignProject}>Assign Project</button>
      <button id="btnCancelForm33" onClick={() => setShowForm(false)}>Cancel</button> {/* Nouveau bouton "Cancel" */}
    </div>
  </div>
)}

      </div>

      {/* Modal pour l'édition de projet */}
      {showEditModal && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h3 className='titleAddproj'>Edit Project</h3>
            <label>Project Name</label>
            <input type="text" name="project_name" placeholder="Nom du Projet" value={newProject.project_name} onChange={handleInputChange} />
            <label>Start Date</label>
            <input type="date" name="start_date" placeholder="Date de Début" value={newProject.start_date} onChange={handleInputChange} />
            <label>End Date</label>
            <input type="date" name="end_date" placeholder="Date de Fin" value={newProject.end_date} onChange={handleInputChange} />
            <label>Status</label>
            <input type="text" name="status" placeholder="Status" value={newProject.status} onChange={handleInputChange} />
            <label>Description</label>
            <textarea name="description" placeholder="Description" value={newProject.description} onChange={handleInputChange}></textarea>
            <button className="btn1" onClick={() => handleUpdateProject(currentProject.project_id)}>Save</button>
            <button className="btn1 cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Formulaire d'ajout de nouveau projet */}
      {isEditing && (
        <div className="edit-modal-overlay">
          <div className="edit-modal">
            <h3 className='titleAddproj'>Add New Project</h3>
            <label>Project Name</label>
            <input type="text" name="project_name" placeholder="Nom du Projet" value={newProject.project_name} onChange={handleInputChange} />
            <label>Start Date</label>
            <input type="date" name="start_date" placeholder="Date de Début" value={newProject.start_date} onChange={handleInputChange} />
            <label>End Date</label>
            <input type="date" name="end_date" placeholder="Date de Fin" value={newProject.end_date} onChange={handleInputChange} />
            <label>Status</label>
            <input type="text" name="status" placeholder="Status" value={newProject.status} onChange={handleInputChange} />
            <label>Description</label>
            <textarea name="description" placeholder="Description" value={newProject.description} onChange={handleInputChange}></textarea>
            <button className="btn1" onClick={handleAddProject}>Save</button>
            <button className="btn1 cancel" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProjects;
