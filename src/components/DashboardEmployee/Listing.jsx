import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Chart, registerables } from 'chart.js';
import './Listing.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

Chart.register(...registerables);

const Listing = () => {
  const projectStatusChartRef = useRef(null);
  const internPerformanceChartRef = useRef(null);
  const [projectData, setProjectData] = useState([]);
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
  const [editInternData, setEditInternData] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('authToken');
      const email = sessionStorage.getItem('email'); // Assurez-vous que l'email est disponible

      if (!token || !email) {
        setError("Token or email not available");
        return;
      }

      try {
        const projectResponse = await axios.get("http://localhost:8080/api/project/listProject");
        const projects = projectResponse.data;
        setProjectData(projects);

        const active = projects.filter(project => project.status === 'Active').length;
        const onHold = projects.filter(project => project.status === 'On Hold').length;
        const completed = projects.filter(project => project.status === 'Completed').length;

        setActiveProjects(active);
        setOnHoldProjects(onHold);
        setCompletedProjects(completed);
        setTotalProjects(projects.length);

        const internsResponse = await axios.get(`http://localhost:8080/api/employee/getIntern/${email}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const internList = internsResponse.data;
        setInterns(internList);

        const pfa = internList.filter(intern => intern.stage_type === 'PFA').length;
        const pfe = internList.filter(intern => intern.stage_type === 'PFE').length;
        const observation = internList.filter(intern => intern.stage_type === 'Observation internship').length;

        setPfaCount(pfa);
        setPfeCount(pfe);
        setObservationCount(observation);
        setTotalUsers(internList.length);

        const performanceData = internList.reduce((acc, intern) => {
          acc[intern.full_name] = intern.progress || 0;
          return acc;
        }, {});
        setInternPerformanceData(performanceData);

        // Mise à jour des graphiques
        updateCharts(projects, performanceData);

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
    if (projectStatusChartRef.current) {
      const ctx1 = projectStatusChartRef.current.getContext('2d');
      if (ctx1) {
        if (projectStatusChartRef.current.chart) {
          projectStatusChartRef.current.chart.destroy();
        }
        projectStatusChartRef.current.chart = new Chart(ctx1, {
          type: 'pie',
          data: {
            labels: ['Active', 'On Hold', 'Completed'],
            datasets: [{
              data: [
                projectData.filter(project => project.status === 'Active').length,
                projectData.filter(project => project.status === 'On Hold').length,
                projectData.filter(project => project.status === 'Completed').length
              ],
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
                    return `${tooltipItem.label}: ${tooltipItem.raw} projects`;
                  }
                }
              }
            }
          }
        });
      } else {
        console.error('Context for projectStatusChart is not available.');
      }
    }
    if (internPerformanceChartRef.current) {
      const ctx2 = internPerformanceChartRef.current.getContext('2d');
      if (ctx2) {
        if (internPerformanceChartRef.current.chart) {
          internPerformanceChartRef.current.chart.destroy();
        }
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
      } else {
        console.error('Context for internPerformanceChart is not available.');
      }
    }
  };

  const handleEditClick = (intern) => {
    setEditInternId(intern.id);
    setEditPresence(intern.presence);
    setEditProgress(intern.progress);
    // Conservez toutes les autres propriétés pour une mise à jour ultérieure
    setEditInternData(intern);
  };

  const handleSaveClick = async (internId) => {
    try {
      const updatedIntern = {
        ...interns.find(intern => intern.id === internId),
        presence: editPresence,
        progress: editProgress
      };
  
      await axios.put(`http://localhost:8080/api/stagiaire/updateStagiaire/${internId}`, updatedIntern);
      setInterns((prevInterns) => {
        const newInterns = prevInterns.map((intern) =>
          intern.id === internId ? { ...intern, presence: editPresence, progress: editProgress } : intern
        );
        // Mettre à jour les graphiques après la mise à jour des stagiaires
        const performanceData = newInterns.reduce((acc, intern) => {
          acc[intern.full_name] = intern.progress || 0;
          return acc;
        }, {});
        setInternPerformanceData(performanceData);
        updateCharts(projectData, performanceData); // Mise à jour des graphiques ici
        return newInterns;
      });
      setEditInternId(null);
    } catch (error) {
      console.error("Failed to update intern data:", error);
      setError("Failed to update intern data. Please try again later.");
    }
  };
  

  const handleCancelClick = () => {
    setEditInternId(null); // Réinitialiser le mode d'édition
    setEditPresence(''); // Réinitialiser les champs d'édition
    setEditProgress('');
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
              <div className="stat-cad1 stat-card">
                <h3>Total Projects</h3>
                <p>{totalProjects}</p>
              </div>
              <div className="stat-cad2 stat-card">
                <h3>Active Projects</h3>
                <p>{activeProjects}</p>
              </div>
              <div className="stat-cad3 stat-card">
                <h3>Completed Projects</h3>
                <p>{completedProjects}</p>
              </div>
              <div className="stat-cad4 stat-card">
                <h3>On Hold Projects</h3>
                <p>{onHoldProjects}</p>
              </div>
              <div className="stat-cad5 stat-card">
                <h3>Total Interns</h3>
                <p>{totalUsers}</p>
              </div>
              <div className="stat-cad6 stat-card">
                <h3>PFA Stagiaires</h3>
                <p>{pfaCount}</p>
              </div>
              <div className="stat-cad7 stat-card">
                <h3>PFE Stagiaires</h3>
                <p>{pfeCount}</p>
              </div>
              <div className="stat-cad8 stat-card">
                <h3>Observation Stagiaires</h3>
                <p>{observationCount}</p>
              </div>
            </div>
          )}
        </section>
        <section id="interns">
          <h2>Interns</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Full Name</th>
                <th>Presence</th>
                <th>Progress</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interns.map((intern) => (
                <tr key={intern.id}>
                  <td>{intern.id}</td>
                  <td>{intern.full_name}</td>
                  <td>{intern.presence}</td>
                  <td>{intern.progress}</td>
                  <td>
                  <FontAwesomeIcon 
                        icon={faEdit}  onClick={() => handleEditClick(intern)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {editInternId && (
            <div className="edit-intern-form">
              <h3>Edit Intern</h3>
              <label>Presence</label>
              <input type="text" value={editPresence} onChange={(e) => setEditPresence(e.target.value)} />
              <label>Progress</label>
              <input type="text" value={editProgress} onChange={(e) => setEditProgress(e.target.value)} />
              <button onClick={() => handleSaveClick(editInternId)}>Save</button>
              <button onClick={handleCancelClick}>Cancel</button>
            </div>
          )}
        </section>
        <section id="charts">
          <h2 className="titre">Charts</h2>
          <div className="chart">
          <canvas ref={projectStatusChartRef} id="projectStatusChart"></canvas>
          <canvas ref={internPerformanceChartRef} id="internPerformanceChart" ></canvas>
          </div>
        </section>
       
      </main>
    </div>
  );
};

export default Listing;
