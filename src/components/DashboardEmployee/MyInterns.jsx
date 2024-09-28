import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import './MyInterns.scss';

const MyInterns = () => {
  const [interns, setInterns] = useState([]);
  const [newStagiaire, setNewStagiaire] = useState({
    full_name: '',
    start_date: '',
    end_date: '',
    email: '',
    school: '',
    speciality: '',
    password: '',
    stage_type: '',
    presence: 0,
    progress: 0,
  });
  const [currentStagiaire, setCurrentStagiaire] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState(null);

  const email = sessionStorage.getItem('email');
  const token = sessionStorage.getItem('authToken');

  useEffect(() => {
    const fetchInterns = async () => {
      try {
        if (!token || !email) {
          throw new Error("Token or email not available");
        }

        const internsResponse = await axios.get(`http://localhost:8080/api/employee/getIntern/${email}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setInterns(internsResponse.data);
      } catch (err) {
        setError('Erreur lors de la récupération des stagiaires');
      }
    };

    fetchInterns();
  }, [email, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStagiaire({ ...newStagiaire, [name]: value });
  };

  const handleAddStagiaire = () => {
    axios.post('http://localhost:8080/api/stagiaire/register', newStagiaire)
      .then(response => {
        setInterns([...interns, response.data]);
        setIsEditing(false);
        setNewStagiaire({
          full_name: '',
          start_date: '',
          end_date: '',
          email: '',
          school: '',
          speciality: '',
          password: '',
          stage_type: '',
          presence: 0,
          progress: 0,
        });
      })
      .catch(err => setError('Erreur lors de l\'ajout du stagiaire'));
  };

  const handleUpdateStagiaire = (id) => {
    axios.put(`http://localhost:8080/api/stagiaire/updateStagiaire/${id}`, newStagiaire)
      .then(response => {
        setInterns(interns.map(intern => (intern.id === id ? response.data : intern)));
        setIsEditing(false);
        setCurrentStagiaire(null);
        setNewStagiaire({
          full_name: '',
          start_date: '',
          end_date: '',
          email: '',
          school: '',
          speciality: '',
          password: '',
          stage_type: '',
          presence: 0,
          progress: 0,
        });
      })
      .catch(err => setError('Erreur lors de la mise à jour du stagiaire'));
  };

  const handleDeleteStagiaire = (id) => {
    axios.delete(`http://localhost:8080/api/stagiaire/deleteStagiaire/${id}`)
      .then(() => {
        setInterns(interns.filter(intern => intern.id !== id));
      })
      .catch(err => setError('Erreur lors de la suppression du stagiaire'));
  };

  const startEditing = (intern) => {
    setCurrentStagiaire(intern);
    setNewStagiaire(intern);
    setIsEditing(true);
  };

  if (error) return <p>{error}</p>;

  return (
    <div className="interns-container9">
    <h1 className='interns-title9'>
        {isEditing ? (currentStagiaire ? 'Edit an Intern' : 'Add an Intern') : 'Interns List'}
      </h1>
      {isEditing ? (
        <div className="edit-container">
           <label>Full Name</label>
          <input type="text" name="full_name" placeholder="Full Name" value={newStagiaire.full_name} onChange={handleInputChange} />
          <label>Start Date</label>
          <input type="date" name="start_date" value={newStagiaire.start_date} onChange={handleInputChange} />
          <label>End Date</label>
          <input type="date" name="end_date" value={newStagiaire.end_date} onChange={handleInputChange} />
          <label>Email</label>
          <input type="email" name="email" placeholder="Email" value={newStagiaire.email} onChange={handleInputChange} />
          <label>School</label>
          <input type="text" name="school" placeholder="School" value={newStagiaire.school} onChange={handleInputChange} />
          <label>Speciality</label>
          <input type="text" name="speciality" placeholder="Speciality" value={newStagiaire.speciality} onChange={handleInputChange} />
          <label>Password</label>
          <input type="text" name="password" placeholder="Password" value={newStagiaire.password} onChange={handleInputChange} />
          <label>Stage Type</label>
          <input type="text" name="stage_type" placeholder="Stage Type" value={newStagiaire.stage_type} onChange={handleInputChange} />

          <label>Presence</label>
          <input type="text" name="presence" placeholder="Presence" value={newStagiaire.presence} onChange={handleInputChange} />
          <label>Progress</label>
          <input type="text" name="progress" placeholder="Progress" value={newStagiaire.progress} onChange={handleInputChange} />

          <div className="button-group9">
            <button className='action-button9 save-button99' onClick={currentStagiaire ? () => handleUpdateStagiaire(currentStagiaire.id) : handleAddStagiaire}>
              {currentStagiaire ? 'Save Changes' : 'Add an Intern'}
            </button>
            <button className='action-button9 delete-button99' onClick={() => {
              setIsEditing(false);
              setCurrentStagiaire(null);
              setNewStagiaire({
                full_name: '',
                start_date: '',
                end_date: '',
                email: '',
                school: '',
                speciality: '',
                password: '',
                stage_type: '',
                presence: 0,
                progress: 0,
              });
            }}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {interns.length > 0 ? (
            <table className="internstable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Email</th>
                  <th>School</th>
                  <th>Speciality</th>
                  <th>Stage Type</th>
                  <th>Progress</th>
                  <th>Presence</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {interns.map((intern) => (
                  <tr key={intern.id}>
                    <td>{intern.id}</td>
                    <td>{intern.full_name}</td>
                    <td>{intern.start_date}</td>
                    <td>{intern.end_date}</td>
                    <td>{intern.email}</td>
                    <td>{intern.school}</td>
                    <td>{intern.speciality}</td>
                    <td>{intern.stage_type}</td>
                    <td>{intern.progress}</td>
                    <td>{intern.presence}</td>
                    <td>
                      <button className="action-button9" onClick={() => startEditing(intern)}>
                        <FaEdit />
                      </button>
                      <button className="action-button9 delete-button99" onClick={() => handleDeleteStagiaire(intern.id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No interns found.</p>
          )}
           <button className="AddNewIntern" onClick={() => setIsEditing(true)}>
            <FaPlus /> Add new intern
          </button>
        </>
      )}
    </div>
  );
};

export default MyInterns ;
