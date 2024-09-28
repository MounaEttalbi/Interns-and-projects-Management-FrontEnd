import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, registerables } from 'chart.js';
import './Listing.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';
import { FaProjectDiagram, FaCheckCircle, FaPauseCircle, FaUsers, FaUserGraduate, FaUserTie, FaHourglassHalf } from 'react-icons/fa';


Chart.register(...registerables);

const Listing = () => {
  const projectStatusChartRef = useRef(null);
  const internPerformanceChartRef = useRef(null);
  const [projectData, setProjectData] = useState({});
  const [interns, setInterns] = useState([]);
  const [internPerformanceData, setInternPerformanceData] = useState({});
  const [totalProjects, setTotalProjects] = useState(0);
  const [activeProjects, setActiveProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [onHoldProjects, setOnHoldProjects] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pfaCount, setPfaCount] = useState(0);
  const [pfeCount, setPfeCount] = useState(0);
  const [observationCount, setObservationCount] = useState(0);
  const [error, setError] = useState(null);

  const [editInternId, setEditInternId] = useState(null);
  const [editPresence, setEditPresence] = useState('');
  const [editProgress, setEditProgress] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectResponse = await axios.get("http://localhost:8080/api/project/project-stats");
        setProjectData(projectResponse.data);

        const internsResponse = await axios.get("http://localhost:8080/api/stagiaire/listStagiaire");
        setInterns(internsResponse.data);

        const pfa = internsResponse.data.filter(intern => intern.stage_type === 'PFA').length;
        const pfe = internsResponse.data.filter(intern => intern.stage_type === 'PFE').length;
        const observation = internsResponse.data.filter(intern => intern.stage_type === 'Observation internship').length;

        setPfaCount(pfa);
        setPfeCount(pfe);
        setObservationCount(observation);

        setTotalUsers(internsResponse.data.length);

        const performanceData = internsResponse.data.reduce((acc, intern) => {
          acc[intern.full_name] = intern.progress || 0;
          return acc;
        }, {});
        setInternPerformanceData(performanceData);

        const totalProjectsCount = Object.values(projectResponse.data).reduce((acc, count) => acc + count, 0);
        setTotalProjects(totalProjectsCount);
        setActiveProjects(projectResponse.data['Active'] || 0);
        setCompletedProjects(projectResponse.data['Completed'] || 0);
        setOnHoldProjects(projectResponse.data['On Hold'] || 0);

        // Mise à jour des graphiques
        updateCharts(projectResponse.data, performanceData);

      } catch (error) {
        console.error('Error fetching data', error);
        setError('Failed to fetch data. Please try again later.');
      }
    };

    fetchData();

    return () => {
      if (projectStatusChartRef.current && projectStatusChartRef.current.chart) {
        projectStatusChartRef.current.chart.destroy();
      }
      if (internPerformanceChartRef.current && internPerformanceChartRef.current.chart) {
        internPerformanceChartRef.current.chart.destroy();
      }
    };
  }, []);

  const updateCharts = (projectData, performanceData) => {
    if (projectStatusChartRef.current && projectStatusChartRef.current.chart) {
      projectStatusChartRef.current.chart.destroy();
    }
    if (internPerformanceChartRef.current && internPerformanceChartRef.current.chart) {
      internPerformanceChartRef.current.chart.destroy();
    }

    const ctx1 = projectStatusChartRef.current.getContext('2d');
    if (ctx1) {
      projectStatusChartRef.current.chart = new Chart(ctx1, {
        type: 'pie',
        data: {
          labels: Object.keys(projectData),
          datasets: [{
            data: Object.values(projectData),
            backgroundColor: ['#ff9999', '#66b3ff', '#99ff99']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top'
            },
            tooltip: {
              callbacks: {
                label: function(tooltipItem) {
                  return `${tooltipItem.label}: ${tooltipItem.raw} projects`; // Fixed the missing backticks
                }
              }
            }
          }
        }
      });
    }

    const ctx2 = internPerformanceChartRef.current.getContext('2d');
    if (ctx2) {
      internPerformanceChartRef.current.chart = new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: Object.keys(performanceData),
          datasets: [{
            label: 'Performance Rating',
            data: Object.values(performanceData),
            backgroundColor: '#4caf50'
          }]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              ticks: {
                autoSkip: false,
              }
            },
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  };

  const updateInternInDatabase = async (id, updatedIntern) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/stagiaire/updateStagiaire/${id}`, updatedIntern);
      console.log('Response:', response.data); // Debugging
      // Récupérer les données mises à jour
      const internsResponse = await axios.get("http://localhost:8080/api/stagiaire/listStagiaire");
      const updatedInterns = internsResponse.data;
      const performanceData = updatedInterns.reduce((acc, intern) => {
        acc[intern.full_name] = intern.progress || 0;
        return acc;
      }, {});
      setInterns(updatedInterns);
      setInternPerformanceData(performanceData);
      updateCharts(projectData, performanceData); // Mise à jour des graphiques avec les nouvelles données
    } catch (error) {
      console.error('Error updating intern data:', error.response ? error.response.data : error.message);
      setError('Failed to update intern data. Please try again later.');
    }
  };

  const handlePresenceChange = (id, value) => {
    const updatedInterns = interns.map(intern => 
      intern.id === id ? { ...intern, presence: value } : intern
    );
    setInterns(updatedInterns);
  
    // Update intern in the database
    const updatedIntern = updatedInterns.find(intern => intern.id === id);
    updateInternInDatabase(id, { ...updatedIntern, presence: value });
  };
  
  const handleProgressChange = (id, value) => {
    const updatedInterns = interns.map(intern => 
      intern.id === id ? { ...intern, progress: value } : intern
    );
    setInterns(updatedInterns);

    const performanceData = updatedInterns.reduce((acc, intern) => {
      acc[intern.full_name] = intern.progress || 0;
      return acc;
    }, {});

    setInternPerformanceData(performanceData);
    updateCharts(projectData, performanceData); // Mise à jour des graphiques avec les nouvelles données
    updateInternInDatabase(id, { ...updatedInterns.find(intern => intern.id === id), progress: value });
  };

  const handleEditClick = (intern) => {
    setEditInternId(intern.id);
    setEditPresence(intern.presence || '');
    setEditProgress(intern.progress || '');
  };

  const handleSaveChanges = () => {
    const intern = interns.find(i => i.id === editInternId);
    if (intern) {
      const updatedIntern = {
        ...intern,
        presence: editPresence,
        progress: editProgress
      };
      updateInternInDatabase(editInternId, updatedIntern);
      setEditInternId(null);
      setEditPresence('');
      setEditProgress('');
    }
  };

  return (
    <div className='mainContent'>
      <main>
        <section id="statistics">
          <h2 className="titre">Statistics</h2>
          {error ? (
            <p className="error-message">{error}</p>
          ) : (
            <div className="statistics-container">
              <div className="stat-card1 stat-card">
                <FaProjectDiagram className="stat-icon" />
                <h3>Total Projects</h3>
                <p>{totalProjects}</p>
              </div>
              <div className="stat-card2 stat-card">
                <FaCheckCircle className="stat-icon" />
                <h3>Active Projects</h3>
                <p>{activeProjects}</p>
              </div>
              <div className="stat-card3 stat-card">
                <FaCheckCircle className="stat-icon" />
                <h3>Completed Projects</h3>
                <p>{completedProjects}</p>
              </div>
              <div className="stat-card4 stat-card">
                <FaHourglassHalf className="stat-icon" />
                <h3>On Hold Projects</h3>
                <p>{onHoldProjects}</p>
              </div>
              <div className="stat-card5 stat-card">
                <FaUsers className="stat-icon" />
                <h3>Total Interns</h3>
                <p>{totalUsers}</p>
              </div>
              <div className="stat-card6 stat-card">
                <FaUserGraduate className="stat-icon" />
                <h3>PFA Interns</h3>
                <p>{pfaCount}</p>
              </div>
              <div className="stat-card7 stat-card">
                <FaUserGraduate className="stat-icon" />
                <h3>PFE Interns</h3>
                <p>{pfeCount}</p>
              </div>
              <div className="stat-card8 stat-card">
                <FaUserGraduate className="stat-icon" />
                <h3>Observation Interns</h3>
                <p>{observationCount}</p>
              </div>
            </div>
          )}
        </section>
        <section id="interns">
          <h2 className="titre">Interns List</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Presence (%)</th>
                <th>Progress (%)</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {interns.map(intern => (
                <tr key={intern.id} id="link">
                  <td>{intern.id}</td>
                  <td><a href="/profileIntern">{intern.full_name}</a></td>
                  <td>
                    {editInternId === intern.id ? (
                      <input 
                        type="number" 
                        value={editPresence} 
                        onChange={e => setEditPresence(e.target.value)} 
                      />
                    ) : (
                      intern.presence
                    )}
                  </td>
                  <td>
                    {editInternId === intern.id ? (
                      <input 
                        type="number" 
                        value={editProgress} 
                        onChange={e => setEditProgress(e.target.value)} 
                      />
                    ) : (
                      intern.progress
                    )}
                  </td>
                  <td>
                    {editInternId === intern.id ? (
                      <button onClick={handleSaveChanges}>Save</button>
                    ) : (
                      <FontAwesomeIcon 
                        icon={faEdit} 
                        onClick={() => handleEditClick(intern)} 
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section id="charts">
          <h2 className="titre">Charts</h2>
          <div className="chart">
            <canvas ref={projectStatusChartRef} id="projectStatusChart"></canvas>
            <canvas ref={internPerformanceChartRef} id="internPerformanceChart"></canvas>
          </div>
        </section>
      </main>
    </div>
  );
}  

export default Listing;
