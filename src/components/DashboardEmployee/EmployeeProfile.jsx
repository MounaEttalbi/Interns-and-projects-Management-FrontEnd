import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './EmployeeProfile.scss'

const EmployeeProfile = () => {
  const [employeeData, setEmployeeData] = useState(null);
  const [originalEmployeeData, setOriginalEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const email = sessionStorage.getItem('email');

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
          console.error("Token not available");
          setLoading(false);
          return;
        }
        if (!email) {
          console.error("Email not available");
          setLoading(false);
          return;
        }
        const response = await axios.get(`http://localhost:8080/api/employee/profile/${email}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log("Employee data fetched:", response.data);
        setEmployeeData(response.data);
        setOriginalEmployeeData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching employee data:", err.response ? err.response.data : err.message);
        setError(err);
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [email]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    if (!employeeData || !employeeData.email) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const token = sessionStorage.getItem('authToken');
      await axios.put(`http://localhost:8080/api/employee/updateEmployee/${employeeData.id}`, employeeData, {
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
    setEmployeeData(originalEmployeeData);
    setIsEditing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading profile.</p>;

  return (
    <div className="profilecontainerEMPP">
      {employeeData && (
        <div className="profileinfoEMPP">
          <div className="profileheaderEMPP">
            <h1>Employee Profile</h1>
          </div>
          {isEditing ? (
            <div className="modalEMPoverlay">
              <div className="modalEMPcontent">
                <h2>Edit Profile</h2>
                <input type="text" name="full_name" value={employeeData.full_name} onChange={handleInputChange} placeholder="Full Name" />
                <input type="email" name="email" value={employeeData.email} onChange={handleInputChange} placeholder="Email" />
                <input type="password" name="password" value={employeeData.password} onChange={handleInputChange} placeholder="Password" />
                <div className="buttoncontainerEMPP">
                  <button className="btnsaveEMPP" onClick={handleSaveClick}>Save</button>
                  <button className="btncancelEMPP" onClick={handleCancelClick}>Cancel</button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <p><b>Full Name:</b> {employeeData.full_name}</p>
              <p><b>Email:</b> {employeeData.email}</p>
              <p><b>Password:</b> {employeeData.password}</p>
              <button className="btneditEMPP" onClick={handleEditClick}>Edit</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeProfile;
