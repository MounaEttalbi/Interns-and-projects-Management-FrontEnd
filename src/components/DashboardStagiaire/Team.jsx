import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSignOutAlt, FaPlus, FaEdit } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import './Team.scss';

const EmployeeTeams = () => {
  const [message, setMessage] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', supervisorId: '' });
  const [stagiaireEmails, setStagiaireEmails] = useState('');
  const email = sessionStorage.getItem('email');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchData = async () => {
    if (!email) {
      setError('No email found in sessionStorage.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/employee/getTeamByInternEmail?email=${email}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des données');
      }
      const actualData = await response.json();
      setData(actualData);
    } catch (err) {
      setError('No team found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [email]);

  const handleCreateOrUpdateTeam = async (e) => {
    e.preventDefault();

    if (!formData.name || !stagiaireEmails) {
      alert('Please enter the team name and stagiaire emails.');
      return;
    }

    const emailsArray = stagiaireEmails.split(',').map(email => email.trim());

    const updateRequest = {
      name: formData.name,
    };

    const apiUrl = selectedTeam
      ? `http://localhost:8080/api/team/update/${selectedTeam.id}`
      : 'http://localhost:8080/api/team/createTeam';

    try {
      const response = selectedTeam
        ? await axios.put(apiUrl, updateRequest)
        : await axios.post(apiUrl, updateRequest);

      const newTeam = response.data;

      const updateResponses = await Promise.all(emailsArray.map(email =>
        axios.post(`http://localhost:8080/api/team/${newTeam.id}/updatestagiaires/${email}`)
      ));

      if (formData.supervisorId) {
        await axios.post(`http://localhost:8080/api/employee/${formData.supervisorId}/teams/${newTeam.id}`);
      }

      alert(`Team ${selectedTeam ? 'updated' : 'created'} successfully!`);
      setFormData({ name: '', supervisorId: '' });
      setStagiaireEmails('');
      setShowForm(false);
      fetchData();
    } catch (error) {
      const errorMessage = error.response ? error.response.data : error.message;
      alert(`An error occurred. Details: ${errorMessage}`);
    }
  };

  const handleCreateForm = () => {
    setFormData({ name: '', supervisorId: '' });
    setStagiaireEmails('');
    setShowForm(true);
    setSelectedTeam(null);
  };

  const handleEditForm = (team) => {
    setFormData({ name: team.name, supervisorId: team.supervisorId || '' });
    setStagiaireEmails(team.interns.map(intern => intern.email).join(', '));
    setShowForm(true);
    setSelectedTeam(team);
  };

  const handleQuitTeam = async () => {
    const intern = data?.teams.find((team) =>
      team.interns.some((intern) => intern.email === email)
    )?.interns.find((intern) => intern.email === email);

    if (!intern) {
      setMessage('No team found');
      return;
    }

    try {
      const response = await axios.put(`http://localhost:8080/api/stagiaire/quitteTeam/${intern.email}`);
      if (response.status === 200) {
        setMessage('');
        setData(null);
        fetchData(); // Refresh the team data after quitting
      } else {
        setMessage('Error occurred');
      }
    } catch (error) {
      setMessage('Error occurred');
    } finally {
      setShowConfirmModal(false); // Close the confirmation modal
    }
  };

  if (loading) return <p>Loading data...</p>;

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={handleCreateForm} className="action-button">
          <FaPlus /> Create Team
        </button>
        {showForm && (
          <div className="team-form-overlay">
            <div className="team-form">
              <form onSubmit={handleCreateOrUpdateTeam}>
                <button id="closeBtn" className="action-button" type="button" onClick={() => setShowForm(false)}>
                  <MdClose />
                </button>
                <h3 className="editprjtitle">{selectedTeam ? 'Update Team' : 'Create Team'}</h3>
                <label>
                  Team Name:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Stagiaire Emails (comma separated):
                  <input
                    type="text"
                    value={stagiaireEmails}
                    onChange={(e) => setStagiaireEmails(e.target.value)}
                    required
                  />
                </label>
                <button className="action-button" id="submitButton" type="submit">
                  {selectedTeam ? 'Update Team' : 'Create Team'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  const teamWithIntern = data?.teams.find((team) =>
    team.interns.some((intern) => intern.email === email)
  );

  if (!teamWithIntern) {
    return (
      <div className="team-container">
        <p className="errormsg">Create your team to collaborate effectively on your project!</p>
        <button onClick={handleCreateForm} className="action-button">
          <FaPlus /> Create Team
        </button>
        {showForm && (
          <div className="team-form-overlay">
            <div className="team-form">
              <form onSubmit={handleCreateOrUpdateTeam}>
                <button id="closeBtn" className="action-button" type="button" onClick={() => setShowForm(false)}>
                  <MdClose />
                </button>
                <h3 className="editprjtitle">{selectedTeam ? 'Update Team' : 'Create Team'}</h3>
                <label>
                  Team Name:
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </label>
                <label>
                  Stagiaire Emails (comma separated):
                  <input
                    type="text"
                    value={stagiaireEmails}
                    onChange={(e) => setStagiaireEmails(e.target.value)}
                    required
                  />
                </label>
                <button className="action-button" id="submitButton" type="submit">
                  {selectedTeam ? 'Update Team' : 'Create Team'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="team-container">
      <h1 className="teamtitle">My Team's information</h1>
      <h3 className="team-title">Team Name: {teamWithIntern.name}</h3>
      <h3 className="team-id">Team ID: {teamWithIntern.id}</h3>

      <div className="members-supervisor">
        <h3 className="members-supervisor-title">Members and Supervisor:</h3>
        {teamWithIntern.interns.length > 0 ? (
          <table className="teamtable">
            <thead>
              <tr>
                <th>Intern Name</th>
                <th>Intern Email</th>
                <th>Supervisor Name</th>
                <th>Supervisor Email</th>
              </tr>
            </thead>
            <tbody>
              {teamWithIntern.interns.map((intern, index) => (
                <tr key={intern.id}>
                  <td>{intern.full_name}</td>
                  <td>{intern.email}</td>
                  {index === 0 && (
                    <>
                      <td rowSpan={teamWithIntern.interns.length}>
                        {data.full_name || 'no supervisor'}
                      </td>
                      <td rowSpan={teamWithIntern.interns.length}>
                        {data.email || 'no supervisor'}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No interns in this team.</p>
        )}
        <div style={{ marginTop: '16px' }}>
          <button className='action33button quitbutton' onClick={() => setShowConfirmModal(true)} style={{ padding: '10px', fontSize: '16px' }}>
            <FaSignOutAlt className='quitterGroupe'/> Quit Team
          </button>
          <button className='action33button editbutton' onClick={() => handleEditForm(teamWithIntern)} style={{ padding: '10px', fontSize: '16px' }}>
            <FaEdit className='editTeam'/> Edit Team
          </button>
        </div>
        {message && <p>{message}</p>}
      </div>
      
      {showConfirmModal && (
        <div className="modalQuitoverlay">
          <div className="modalQuitcontent">
            <h3>Are you sure you want to quit the team?</h3>
            <div className="modalQuitbuttons">
              <button className="actionQuitbutton confirmQuitbutton" onClick={handleQuitTeam}>
                Yes
              </button>
              <button className="actionQuitbutton cancelQuitbutton" onClick={() => setShowConfirmModal(false)}>
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="team-form-overlay">
          <div className="team-form">
            <form onSubmit={handleCreateOrUpdateTeam}>
              <button id="closeBtn" className="action-button" type="button" onClick={() => setShowForm(false)}>
                <MdClose />
              </button>
              <h3 className="editprjtitle">{selectedTeam ? 'Update Team' : 'Create Team'}</h3>
              <label>
                Team Name:
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </label>
              <label>
                Stagiaire Emails (comma separated):
                <input
                  type="text"
                  value={stagiaireEmails}
                  onChange={(e) => setStagiaireEmails(e.target.value)}
                  required
                />
              </label>
              <button className="action-button" id="submitButton" type="submit">
                {selectedTeam ? 'Update Team' : 'Create Team'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTeams;
