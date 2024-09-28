import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StagiaireList.css';
import { FaEdit, FaTrash, FaEye, FaSearch } from 'react-icons/fa';

const StagiaireList = () => {
  const [stagiaires, setStagiaires] = useState([]);
  const [filteredStagiaires, setFilteredStagiaires] = useState([]);
  const [editing, setEditing] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [stagiaireToDelete, setStagiaireToDelete] = useState(null);
  const [currentStagiaire, setCurrentStagiaire] = useState({
    id: null,
    full_name: '',
    email: '',
    start_date: '',
    end_date: '',
    stage_type: '',
    speciality: '',
    school: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/api/stagiaire/listStagiaire')
      .then(response => {
        setStagiaires(response.data);
        setFilteredStagiaires(response.data);
      })
      .catch(error => {
        console.error('Error fetching stagiaires:', error);
      });
  }, []);

  useEffect(() => {
    const filtered = stagiaires.filter(stagiaire =>
      stagiaire.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStagiaires(filtered);
  }, [searchTerm, stagiaires]);

  const handleEdit = (stagiaire) => {
    setEditing(true);
    setCurrentStagiaire(stagiaire);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/stagiaire/updateStagiaire/${currentStagiaire.id}`, currentStagiaire);
      setStagiaires(stagiaires.map(stagiaire => (stagiaire.id === currentStagiaire.id ? currentStagiaire : stagiaire)));
      setEditing(false);
    } catch (error) {
      console.error('Error updating stagiaire:', error);
    }
  };

  const handleDeleteClick = (id) => {
    setShowConfirmModal(true);
    setStagiaireToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/stagiaire/deleteStagiaire/${stagiaireToDelete}`);
      setStagiaires(stagiaires.filter(stagiaire => stagiaire.id !== stagiaireToDelete));
      setFilteredStagiaires(filteredStagiaires.filter(stagiaire => stagiaire.id !== stagiaireToDelete));
      setShowConfirmModal(false);
      setStagiaireToDelete(null);
    } catch (error) {
      console.error('Error deleting stagiaire:', error);
    }
  };

  const handleDeleteCancel = () => {
    setShowConfirmModal(false);
    setStagiaireToDelete(null);
  };

  const handleView = (stagiaire) => {
    setCurrentStagiaire(stagiaire);
    setViewing(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentStagiaire({ ...currentStagiaire, [name]: value });
  };

  const closeModal = () => {
    setViewing(false);
  };

  return (
    <div className='tabStag'>
      <h1 className='titleStag1'>Interns</h1>

      <div className="searchContainerS">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="searchBarS"
        />
        <FaSearch className="searchIconS" />
      </div>

      {editing ? (
        <div className="editFormContainer">
          <h2 className="editFormTitle">Edit Intern's Information</h2>
          <form className="editForm" onSubmit={handleUpdate}>
            <label>
              Full Name:
              <input type="text" name="full_name" value={currentStagiaire.full_name} onChange={handleChange} />
            </label>
            <label>
              Email:
              <input type="email" name="email" value={currentStagiaire.email} onChange={handleChange} />
            </label>
            <label>
              Start Date:
              <input type="date" name="start_date" value={currentStagiaire.start_date} onChange={handleChange} />
            </label>
            <label>
              End Date:
              <input type="date" name="end_date" value={currentStagiaire.end_date} onChange={handleChange} />
            </label>
            <label>
              Stage Type:
              <input type="text" name="stage_type" value={currentStagiaire.stage_type} onChange={handleChange} />
            </label>
            <label>
              Speciality:
              <input type="text" name="speciality" value={currentStagiaire.speciality} onChange={handleChange} />
            </label>
            <label>
              School:
              <input type="text" name="school" value={currentStagiaire.school} onChange={handleChange} />
            </label>
            <div className="formButtons">
              <button type="submit">Update</button>
              <button type="button" onClick={() => setEditing(false)}>Cancel</button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th className='titleStag2'>Id</th>
                <th className='titleStag2'>FullName</th>
                <th className='titleStag2'>Email</th>
                <th className='titleStag2'>Start Date</th>
                <th className='titleStag2'>End Date</th>
                <th className='titleStag2'>Stage Type</th>
                <th className='titleStag2'>Speciality</th>
                <th className='titleStag2'>School</th>
                <th className='titleStag2'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStagiaires.map(stagiaire => (
                <tr key={stagiaire.id}>
                  <td>{stagiaire.id}</td>
                  <td>{stagiaire.full_name}</td>
                  <td>{stagiaire.email}</td>
                  <td>{stagiaire.start_date}</td>
                  <td>{stagiaire.end_date}</td>
                  <td>{stagiaire.stage_type}</td>
                  <td>{stagiaire.speciality}</td>
                  <td>{stagiaire.school}</td>
                  <td>
                    <FaEdit className='actionIconS actionEdits' onClick={() => handleEdit(stagiaire)} />
                    <FaTrash className='actionIconS actionDeletes' onClick={() => handleDeleteClick(stagiaire.id)} />
                    <FaEye className='actionIconS actionViews' onClick={() => handleView(stagiaire)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {viewing && (
        <div className="modal">
          <div className="modalContent">
            <span className="closeButton" onClick={closeModal}>&times;</span>
            <h2>View Intern's Information</h2>
            <p><strong>Full Name:</strong> {currentStagiaire.full_name}</p>
            <p><strong>Email:</strong> {currentStagiaire.email}</p>
            <p><strong>Start Date:</strong> {currentStagiaire.start_date}</p>
            <p><strong>End Date:</strong> {currentStagiaire.end_date}</p>
            <p><strong>Stage Type:</strong> {currentStagiaire.stage_type}</p>
            <p><strong>Speciality:</strong> {currentStagiaire.speciality}</p>
            <p><strong>School:</strong> {currentStagiaire.school}</p>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="modal-overlayo">
          <div className="modal-containero">
            <h3>Are you sure you want to delete this intern?</h3>
            <div className="modal-buttonso">
              <button onClick={handleDeleteConfirm} className="confirm-btno">Delete</button>
              <button onClick={handleDeleteCancel} className="cancel-btno">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StagiaireList;
