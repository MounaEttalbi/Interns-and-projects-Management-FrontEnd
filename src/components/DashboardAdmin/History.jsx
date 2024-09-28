import React, { useEffect, useState } from "react";
import axios from "axios";
import './History.scss';
import { format } from 'date-fns';
import { FaTrash } from 'react-icons/fa'; // FontAwesome delete icon

const History = () => {
  const [historyRecords, setHistoryRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/history")
      .then((response) => {
        setHistoryRecords(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("There was an error fetching the history records!", error);
        setError("Failed to load history records.");
        setLoading(false);
        showNotification("Failed to load history records.", "error");
      });
  }, []);

  const handleDelete = (id) => {
    axios
      .delete(`http://localhost:8080/api/history/deleteHistory/${id}`)
      .then(() => {
        setHistoryRecords(historyRecords.filter(record => record.id !== id));
        showNotification("Record deleted successfully.");
      })
      .catch((error) => {
        console.error("There was an error deleting the record!", error);
        showNotification("Failed to delete record.", "error");
      });
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  };

  if (loading) {
    return <div className="history">Loading...</div>;
  }

  if (error) {
    return <div className="history error">{error}</div>;
  }

  return (
    <div className="history">
      <p className="historyAdmin">History</p>
      <ul>
        {historyRecords.length === 0 ? (
          <li>No history records found.</li>
        ) : (
          historyRecords.map((record) => (
            <li key={record.id}>
              <button className="deleteButton" onClick={() => handleDelete(record.id)}>
                <FaTrash />
              </button>
              <span className="actionType">{record.actionType}</span>
              <span className="entity">{record.entity}</span>
              <span className="timestamp">{format(new Date(record.timestamp), 'dd MMM yyyy HH:mm:ss')}</span>
              <span className="description">{record.description}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default History;
