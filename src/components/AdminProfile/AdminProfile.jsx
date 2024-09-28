import React, { useEffect, useState } from "react";
import axios from "axios";
import './AdminProfile.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit, faCamera } from '@fortawesome/free-solid-svg-icons';

const AdminProfile = ({ setPhotoUrl }) => {
  const [admin, setAdmin] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = () => {
    axios.get('http://localhost:8080/api/admin/profile')
      .then(response => {
        setAdmin(response.data);
        const photoUrl = response.data.photoPath
          ? `http://localhost:8080/${response.data.photoPath}`
          : null;
        setPhoto(photoUrl);
        setPhotoUrl(photoUrl);
      })
      .catch(error => {
        console.error('Error fetching admin:', error);
      });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    if (!admin.first_name || !admin.last_name || !admin.email || !admin.role || !admin.num_tel) {
      alert('Please fill in all fields.');
      return;
    }

    const formData = new FormData();
    formData.append('first_name', admin.first_name);
    formData.append('last_name', admin.last_name);
    formData.append('email', admin.email);
    formData.append('role', admin.role);
    formData.append('num_tel', admin.num_tel);
    formData.append('id', admin.id);

    if (newPhoto) {
      formData.append('photo', newPhoto);
    }

    axios.post(`http://localhost:8080/api/admin/updateAdmin/${admin.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    .then(response => {
      alert('Profile updated successfully');
      setAdmin(response.data);
      const uniqueParam = new Date().getTime();
      const photoUrl = response.data.photoPath
        ? `http://localhost:8080/${response.data.photoPath}?${uniqueParam}`
        : null;

      if (photoUrl) {
        setPhoto(photoUrl);
        setPhotoUrl(photoUrl);
      }

      setIsEditing(false);
    })
    .catch(error => {
      console.error('Error updating profile:', error.response ? error.response.data : error.message);
      alert('Error updating profile: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdmin(prevAdmin => ({
      ...prevAdmin,
      [name]: value
    }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="adminProfile">
      <div className="card profile-card full-card">
        <div className="card-bodyAdmin">
          <h4 className="titreAdmin">Admin Profile</h4>
          <div className="profile-photo-container">
            {photo ? (
              <img
                src={photo}
                alt="Admin Profile"
                onClick={() => document.getElementById('file-input').click()}
                className="profile-photo"
              />
            ) : (
              <div className="photo-placeholder" onClick={() => document.getElementById('file-input').click()}>
                <FontAwesomeIcon icon={faUser} size="3x" />
              </div>
            )}
            <input
              id="file-input"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />
          </div>

          {!isEditing ? (
            <div className="info-details">
              <p><strong>First Name:</strong> {admin.first_name}</p>
              <p><strong>Last Name:</strong> {admin.last_name}</p>
              <p><strong>Email:</strong> {admin.email}</p>
              <p><strong>Role:</strong> {admin.role}</p>
              <p><strong>Phone Number:</strong> {admin.num_tel}</p>
              <button className="edit-buttonProfile" onClick={handleEditClick}>
                <FontAwesomeIcon icon={faEdit} /> Edit Profile
              </button>
            </div>
          ) : (
            <div className="modal-overlayProfile">
              <div className="modal-contentProfile">
                <button className="close-buttonProfile" onClick={() => setIsEditing(false)}>×</button>
                <div className="modal-formProfile">
                  <div className="profile-photo-container2">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Admin Profile"
                        className="profile-photo"
                      />
                    ) : (
                      <div className="photo-placeholder">
                        <FontAwesomeIcon icon={faUser} size="3x" />
                      </div>
                    )}
                    <input
                      id="file-input-edit"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handlePhotoChange}
                    />
                    <button onClick={() => document.getElementById('file-input-edit').click()} className="change-photo-button">
                      <FontAwesomeIcon icon={faCamera} />
                    </button>
                  </div>
                  <p>
                    <strong>First Name:</strong>
                    <input 
                      type="text" 
                      name="first_name" 
                      value={admin.first_name || ''} 
                      onChange={handleInputChange} 
                    />
                  </p>
                  <p>
                    <strong>Last Name:</strong>
                    <input 
                      type="text" 
                      name="last_name" 
                      value={admin.last_name || ''} 
                      onChange={handleInputChange} 
                    />
                  </p>
                  <p>
                    <strong>Email:</strong>
                    <input 
                      type="email" 
                      name="email" 
                      value={admin.email || ''} 
                      onChange={handleInputChange} 
                    />
                  </p>
                  <p>
                    <strong>Role:</strong>
                    <input 
                      type="text" 
                      name="role" 
                      value={admin.role || ''} 
                      onChange={handleInputChange} 
                    />
                  </p>
                  <p>
                    <strong>Phone Number:</strong>
                    <input 
                      type="text" 
                      name="num_tel" 
                      value={admin.num_tel || ''} 
                      onChange={handleInputChange} 
                    />
                  </p>
                  <button className="save-button3" onClick={handleSaveClick}>Save</button>
                  <button className="cancel-button3" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
