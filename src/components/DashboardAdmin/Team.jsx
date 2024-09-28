import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Team.scss';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const Team = () => {
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [formData, setFormData] = useState({ name: '', encadrantId: '' });
  const [stagiaireEmails, setStagiaireEmails] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [encadrants, setEncadrants] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);

  useEffect(() => {
    fetchTeams();
    fetchEmployees();
  }, []);

  const fetchTeams = async () => {
    try {
        const response = await axios.get('http://localhost:8080/api/team/list');
        console.log('Teams response:', response.data);

        const teamsWithEncadrants = response.data.map(team => {
            console.log('Processing team:', team);
            const encadrant = team.encadrant || {};
            console.log('Encadrant:', encadrant);

            return {
                ...team,
                encadrantName: encadrant.full_name || 'N/A',
                encadrantId: encadrant.id || 'N/A'
            };
        });

        setTeams(teamsWithEncadrants);
    } catch (error) {
        setError('Failed to load teams.');
    } finally {
        setLoading(false);
    }
};


  const fetchEmployees = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/employee/listEmployee');
      console.log('Employees response:', response.data); // Log API response
      setEmployees(response.data);
      setEncadrants(response.data); // Assuming all employees can be supervisors
    } catch (error) {
      console.error('Failed to load employees:', error);
      setError('Failed to load employees.');
    }
  };

  const handleUpdate = (team) => {
    setSelectedTeam(team);
    setFormData({ name: team.name, encadrantId: team.encadrant ? team.encadrant.id : '' });
    setStagiaireEmails(team.interns.map(intern => intern.email).join(', '));
    setShowForm(true);
  };
const handleCreateOrUpdateTeam = async (e) => {
    e.preventDefault();

    if (!formData.name || !stagiaireEmails) {
        alert('Please enter the team name and stagiaire emails.');
        return;
    }

    const emailsArray = stagiaireEmails.split(',').map(email => email.trim());
    console.log('Emails array:', emailsArray);

    const updateRequest = {
        name: formData.name,
        encadrantId: formData.encadrantId
    };

    try {
        const response = selectedTeam
            ? await axios.put(`http://localhost:8080/api/team/update/${selectedTeam.id}`, updateRequest)
            : await axios.post('http://localhost:8080/api/team/createTeam', updateRequest);

        const newTeam = response.data;

        // Envoi des emails des stagiaires en une seule requête
        await axios.post(`http://localhost:8080/api/team/${newTeam.id}/updatestagiaires`, emailsArray);

        if (formData.encadrantId) {
            await axios.post(`http://localhost:8080/api/team/${newTeam.id}/assignEncadrant/${formData.encadrantId}`);
        }

        alert(`Team ${selectedTeam ? 'updated' : 'created'} successfully!`);
        setFormData({ name: '', encadrantId: '' });
        setStagiaireEmails('');
        setSelectedTeam(null);
        setShowForm(false);

        // Re-fetch teams to ensure data is up-to-date
        fetchTeams();

    } catch (error) {
        console.error('Error during team creation or update:', error);
        alert(`An error occurred: ${error.response ? error.response.data : error.message}`);
    }
};


  const handleDeleteClick = (teamId) => {
    setTeamToDelete(teamId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (teamToDelete) {
      axios.delete(`http://localhost:8080/api/team/delete/${teamToDelete}`)
        .then(() => {
          setTeams(teams.filter(team => team.id !== teamToDelete));
          alert('Team deleted successfully!');
        })
        .catch(error => {
          console.error('Error deleting team:', error);
          alert(`An error occurred while deleting the team. Details: ${error.response ? error.response.data : error.message}`);
        })
        .finally(() => {
          setShowDeleteConfirm(false);
          setTeamToDelete(null);
        });
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddNewTeam = () => {
    setSelectedTeam(null); // Clear selected team to ensure form state is reset
    setFormData({ name: '', encadrantId: '' });
    setStagiaireEmails('');
    setShowForm(true);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  // Enrich team data with encadrant details
  const teamDetails = teams.map(team => {
    console.log(`Processing team: ${JSON.stringify(team)}`); // Log the team data
    const supervisor = team.encadrant; // Use the encadrant field directly
    console.log(`Team ID: ${team.id}, Supervisor ID: ${supervisor ? supervisor.id : 'N/A'}, Supervisor Found: ${supervisor}`);
    return {
      ...team,
      encadrantName: supervisor ? supervisor.full_name : 'N/A',
      encadrantId: supervisor ? supervisor.id : 'N/A'
    };
  });

  return (
    <div className='teamContain'>
      <h1 className='title12'>Team Information</h1>
      
      {teamDetails.length > 0 ? (
        <>
          <table className="team-table">
            <thead>
              <tr>
                <th>Team ID</th>
                <th>Team Name</th>
                <th>Interns</th>
                <th>Supervisor Id</th>
                <th>Supervisor Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teamDetails.map(team => (
                <tr key={team.id}>
                  <td>{team.id}</td>
                  <td>{team.name}</td>
                  <td>
                    {team.interns && team.interns.length > 0 ? (
                      <table className="intern-table">
                        <thead>
                          <tr>
                            <th>Intern ID</th>
                            <th>Intern Name</th>
                          </tr>
                        </thead>
                        <tbody>
                          {team.interns.map(intern => (
                            <tr key={intern.id}>
                              <td>{intern.id}</td>
                              <td>{intern.full_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : 'No interns'}
                  </td>
                  <td>{team.encadrantId}</td>
                  <td>{team.encadrantName}</td>
                  <td>
                    <button className='modifierTeam' onClick={() => handleUpdate(team)}>
                      <FaEdit />
                    </button>
                    <button className='supprimerTeam' onClick={() => handleDeleteClick(team.id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className='addTeam-button' onClick={handleAddNewTeam}>
            <FaPlus /> Add New Team
          </button>
        </>
      ) : (
        <p>No teams available.</p>
      )}

      {showForm && (
        <div className="modalteam">
          <div className="modal-contentteam">
            <span className="closeteam" onClick={() => setShowForm(false)}>&times;</span>
            <h2>{selectedTeam ? 'Update Team' : 'Create New Team'}</h2>
            <form onSubmit={handleCreateOrUpdateTeam}>
              <label htmlFor="name">Team Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />

              <label htmlFor="encadrantId">Select Supervisor:</label>
              <select
                id="encadrantId"
                name="encadrantId"
                value={formData.encadrantId}
                onChange={handleFormChange}
              >
                <option value="">Select Supervisor</option>
                {encadrants.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                ))}
              </select>

              <label htmlFor="stagiaireEmails">Stagiaire Emails (comma separated):</label>
              <input
                type="text"
                id="stagiaireEmails"
                value={stagiaireEmails}
                onChange={(e) => setStagiaireEmails(e.target.value)}
                required
              />

              <button type="submit">
                {selectedTeam ? 'Update' : 'Create'} Team
              </button>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modalteam2">
          <div className="modal-contentteam2">
            <h3>Are you sure you want to delete this team?</h3>
            <button className='deleteTeam'onClick={confirmDelete}>Yes, Delete</button>
            <button className='cancelDelete' onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
