import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './MyTeams.scss'; // Assure-toi d'importer ton CSS

const MyTeams = () => {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const email = sessionStorage.getItem('email');

  const fetchTeams = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      if (!token || !email) {
        throw new Error("Token or email not available");
      }
      const response = await axios.get(`http://localhost:8080/api/employee/getTeam/${email}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTeams(response.data);
    } catch (err) {
      console.error("Error fetching teams:", err.response ? err.response.data : err.message);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await axios.get(`http://localhost:8080/api/project/listProject`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProjects(response.data);
    } catch (err) {
      console.error("Error fetching projects:", err.response ? err.response.data : err.message);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchProjects();
  }, [email]);

 

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading teams: {error.message}</p>;

  return (
    <div className="my-teams-container">
      <h1 className='teamtitle'>My Teams</h1>
      {teams.length === 0 ? (
        <p>No teams found.</p>
      ) : (
        teams.map((team) => (
          <div key={team.id} className="myteam-container">
            <h3 className='teamtitle2'><strong>Team name:</strong>   {team.name}</h3>
            <h3 className='teamtitle2'><strong>Team id:</strong>   {team.id}</h3>
            <h3 className='teamtitle2'><strong>Interns:</strong></h3>
            {team.interns.length === 0 ? (
              <p>No interns in this team.</p>
            ) : (
              <table className="interns-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Full Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Email</th>
                    <th>School</th>
                    <th>Speciality</th>
                    <th>Password</th>
                    <th>Stage Type</th>
                    <th>Progress</th>
                    <th>Presence</th>
                  </tr>
                </thead>
                <tbody>
                  {team.interns.map((intern) => (
                    <tr key={intern.id}>
                      <td>{intern.id}</td>
                      <td>{intern.full_name}</td>
                      <td>{intern.start_date}</td>
                      <td>{intern.end_date}</td>
                      <td>{intern.email}</td>
                      <td>{intern.school}</td>
                      <td>{intern.speciality}</td>
                      <td>{intern.password}</td>
                      <td>{intern.stage_type}</td>
                      <td>{intern.progress}</td>
                      <td>{intern.presence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default MyTeams;
