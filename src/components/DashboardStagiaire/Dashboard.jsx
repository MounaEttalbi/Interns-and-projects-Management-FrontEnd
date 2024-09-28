import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import axios from 'axios';
import './Dashboard.scss'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const Dashboard = () => {
  const [taskStats, setTaskStats] = useState({
    total: 0,
    done: 0,
    inProgress: 0,
    toDo: 0
  });

  useEffect(() => {
    const fetchTaskStats = async () => {
      try {
        const teamId = sessionStorage.getItem('teamId');
        if (!teamId) {
          console.error('ID de l\'équipe non trouvé dans sessionStorage');
          return;
        }
        const response = await axios.get(`http://localhost:8080/api/tasks/statistics/team?teamId=${teamId}`);
        console.log('Réponse de l\'API:', response.data); // Vérifiez la réponse de l'API
        setTaskStats({
          total: response.data.total || 0,
          done: response.data.done || 0,
          inProgress: response.data.inProgress || 0,
          toDo: response.data.toDo || 0
        });
      } catch (error) {
        console.error("Erreur lors de la récupération des statistiques des tâches", error);
      }
    };

    fetchTaskStats();
  }, []);

  const barChartData = {
    labels: ['Done', 'In Progress', 'To Do'],
    datasets: [
      {
        label: 'Tasks',
        data: [taskStats.done, taskStats.inProgress, taskStats.toDo],
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
      },
    ],
  };

  const doughnutChartData = {
    labels: ['Done', 'In Progress', 'To Do'],
    datasets: [
      {
        label: 'Tasks',
        data: [taskStats.done, taskStats.inProgress, taskStats.toDo],
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
      },
    ],
  };

  return (
    <div className="dashboard-stagiaireI">
      <h1>Dashboard Stagiaire</h1>

      <div className="statisticsIntern">
    <div className="stat-card total">
        <p className='TotalTask'>Total Tasks</p>
        <p>{taskStats.total}</p>
    </div>
    <div className="stat-card done">
        <p className='TotalTask'>Tasks Done</p>
        <p>{taskStats.done}</p>
    </div>
    <div className="stat-card inProgress">
        <p className='TotalTask'>Tasks In Progress</p>
        <p>{taskStats.inProgress}</p>
    </div>
    <div className="stat-card toDo">
        <p className='TotalTask'>Tasks To Do</p>
        <p>{taskStats.toDo}</p>
    </div>
</div>

      <div className="chartsIntern">
        <div className="chartIntern">
          <p className='taskdistribution'>Task Distribution</p>
          <Bar data={barChartData} />
        </div>
        <div className="chartIntern">
          <p className='taskdistribution'>Task Overview</p>
          <Doughnut data={doughnutChartData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
