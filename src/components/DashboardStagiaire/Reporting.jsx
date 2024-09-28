import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify'; 
import { FaDownload } from 'react-icons/fa'; // Importer l'icône de téléchargement
import 'react-toastify/dist/ReactToastify.css'; 
import './Reporting.scss';

const Reporting = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [supervisor, setSupervisor] = useState('');
  const [employeeId, setEmployeeId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportStatus, setReportStatus] = useState(''); 
  const [reports, setReports] = useState([]); // New state for reports

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/employee/listEmployee');
        setEmployees(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load employees:', error);
        setError('Failed to load employees.');
        setLoading(false);
      }
    };

    const fetchReports = async () => {
      try {
        const stagiaireId = sessionStorage.getItem('userId'); // Récupérer l'ID du stagiaire depuis sessionStorage
        const response = await axios.get(`http://localhost:8080/api/reports/stagiaire/${stagiaireId}`);
        setReports(response.data);
      } catch (error) {
        console.error('Failed to load reports:', error);
        toast.error('Failed to load reports.');
      }
    };

    fetchEmployees();
    fetchReports(); // Fetch reports on component mount
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);
    formData.append('supervisor', supervisor);
    formData.append('employeeId', employeeId);
    formData.append('stagiaireId', sessionStorage.getItem('userId')); // Add stagiaireId to FormData
  
    axios.post('http://localhost:8080/api/reports/submit', formData)
      .then(response => {
        const { status } = response.data; 
        setReportStatus(status); 
        toast.success(`Report submitted successfully to  ${supervisor}`); 
        setTitle('');
        setDescription('');
        setFile(null);
        setSupervisor('');
        setEmployeeId(null);
        document.getElementById('file').value = '';
        fetchReports(); // Refresh reports after submitting a new one
      })
      
  };
  
  return (
    <div className="reportingContainer">
      <div className="leftColumn"> {/* New left column for reports */}
        <p className='myReports'>My Reports</p>
        {reports.length > 0 ? (
          reports.map(report => (
            <div key={report.id} className="reportCard">
              <h3>{report.title}</h3>
              <p><strong>Description: </strong> {report.description}</p>
              <p><strong>Supervisor: </strong>{report.supervisor}</p>
              <p><strong>Status :   
  <span
    className={`statuscolor ${report.status ? 
      report.status.toLowerCase().replace(' ', '-') : 'sented'}`}
  >
    {report.status ? report.status : 'Sented'}
  </span>
</strong></p>

              <p><strong>Repport File :</strong>
                            <div className="report-download2">
                                <a 
                                    href={`data:application/pdf;base64,${report.file}`} 
                                    download={report.fileName}
                                    className="downloadLink2"
                                >
                                    <FaDownload className="download-icon2" /> {/* React Icons download icon */}
                                    Download
                                </a>
                            </div>
              </p>
            </div>
          ))
        ) : (
          <p>No reports found.</p>
        )}
      </div>

      <div className="rightColumn"> {/* Existing form content */}
        <p className='FinalProject'>Submit Final Project Report</p>
        {loading ? (
          <p>Loading employees...</p>
        ) : error ? (
          <p>{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className="reportingForm">
            <div className="formGroup">
              <label htmlFor="title">Report Title</label>
              <input 
                type="text" 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </div>

            <div className="formGroup">
              <label htmlFor="description">Description</label>
              <textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
              ></textarea>
            </div>

            <div className="formGroup">
              <label htmlFor="file">Upload Report (PDF, Word)</label>
              <input 
                type="file" 
                id="file" 
                accept=".pdf,.doc,.docx" 
                onChange={(e) => setFile(e.target.files[0])} 
                required 
              />
            </div>

            <div className="formGroup">
              <label htmlFor="supervisor">Select Supervisor</label>
              <select 
                id="supervisor" 
                value={supervisor} 
                onChange={(e) => {
                  setSupervisor(e.target.value);
                  const selectedEmployee = employees.find(emp => emp.full_name === e.target.value);
                  if (selectedEmployee) {
                    setEmployeeId(selectedEmployee.id);
                  }
                }} 
                required
              >
                <option value="" disabled>Select your supervisor</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.full_name}>
                    {employee.full_name}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="submitButton">Submit Report</button>
          </form>
        )}

        {reportStatus && ( 
          <p className="reportStatus">Report Status: {reportStatus}</p>
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Reporting;
