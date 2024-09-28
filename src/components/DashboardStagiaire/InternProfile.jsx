import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './InternProfile.scss';

const InternProfile = () => {
  const [userData, setUserData] = useState(null);
  const [originalUserData, setOriginalUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const email = sessionStorage.getItem('email');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token || !email) {
          console.error("Token or email not available");
          setLoading(false);
          return;
        }
        const response = await axios.get(`http://localhost:8080/api/stagiaire/profile/${email}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("User data fetched:", response.data);
        setUserData(response.data);
        setOriginalUserData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err.response ? err.response.data : err.message);
        setError(err);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [email]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (!userData || !userData.email) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const token = sessionStorage.getItem('authToken');
      await axios.put(`http://localhost:8080/api/stagiaire/updateStagiaire/${userData.id}`, userData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      alert('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error.response ? error.response.data : error.message);
      alert('Error updating profile: ' + (error.response ? JSON.stringify(error.response.data) : error.message));
    }
  };

  const handleCancelClick = () => {
    setUserData(originalUserData);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading profile.</p>;

  return (
    <div className="profilecontainer">
      {userData && (
        <div className="profileinfo">
          <div className="profileheader">
            <h1>Intern Profile</h1>
          </div>
          {isEditing ? (
            <div className="modal-overlayIntern">
              <div className="modal-contentIntern">
                <h2>Edit Profile</h2>
                <div className="editcontainerS">
                  <input type="text" name="full_name" value={userData.full_name} onChange={handleInputChange} />
                  <input type="text" name="start_date" value={userData.start_date} onChange={handleInputChange} />
                  <input type="email" name="email" value={userData.email} onChange={handleInputChange} />
                  <input type="text" name="end_date" value={userData.end_date} onChange={handleInputChange} />
                  <input type="text" name="school" value={userData.school} onChange={handleInputChange} />
                  <input type="text" name="speciality" value={userData.speciality} onChange={handleInputChange} />
                  <input type="text" name="stage_type" value={userData.stage_type} onChange={handleInputChange} />
                  <input type="password" name="password" value={userData.password} onChange={handleInputChange} />
                  <div className="buttoncontainer">
                    <button className="btnsave" onClick={handleSaveClick}>Save</button>
                    <button className="btncancel" onClick={handleCancelClick}>Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p><b>Full Name:</b> {userData.full_name}</p>
              <p><b>Start Date: </b>{userData.start_date}</p>
              <p><b>Email:</b> {userData.email}</p>
              <p><b>End Date: </b>{userData.end_date}</p>
              <p><b>School:</b> {userData.school}</p>
              <p><b>Speciality:</b> {userData.speciality}</p>
              <p><b>Stage type:</b> {userData.stage_type}</p>
              <p><b>Password:</b> {userData.password}</p>
              <p><b>Presence:</b> {userData.presence}</p>
              <p><b>Progress:</b> {userData.progress}</p>
              <button className="btneditintern" onClick={handleEditClick}>Edit</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InternProfile;
