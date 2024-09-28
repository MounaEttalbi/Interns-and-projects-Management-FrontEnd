import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload } from 'react-icons/fa';
import './EmployeeReports.scss';

const EmployeeReports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const userId = sessionStorage.getItem('userId');

                if (!userId) {
                    throw new Error('User ID is missing in sessionStorage');
                }

                // Fetch reports for the employee with associated stagiaire information
                const response = await axios.get(`http://localhost:8080/api/reports/employee/${userId}`);
                console.log('Response data:', response.data);

                if (Array.isArray(response.data)) {
                    // Load statuses from localStorage
                    const updatedReports = response.data.map(report => {
                        const savedStatus = localStorage.getItem(`reportStatus_${report.id}`);
                        return {
                            ...report,
                            status: savedStatus || report.status
                        };
                    });
                    setReports(updatedReports);
                } else {
                    throw new Error('Expected an array but received:', response.data);
                }
            } catch (error) {
                console.error('Error fetching reports:', error);
                setError('Error fetching reports.');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const handleStatusUpdate = async (reportId, status) => {
        // Check if reportId is valid
        if (!reportId || isNaN(reportId)) {
            console.error('Invalid report ID:', reportId);
            return; // Do not proceed if ID is invalid
        }

        try {
            // Perform PUT request with a valid reportId
            await axios.put(`http://localhost:8080/api/reports/${reportId}/status`, {
                status: status
            });

            // Update reports after successful response
            const updatedReports = reports.map(report =>
                report.id === reportId ? { ...report, status } : report
            );
            setReports(updatedReports);

            // Save status in localStorage
            localStorage.setItem(`reportStatus_${reportId}`, status);
        } catch (error) {
            console.error('Error updating report status:', error.response?.data || error.message);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="reportcontainer">
            <p className='employeeReportsTitle'>Employee Reports</p>
            {error ? (
                <p>{error}</p>
            ) : reports.length > 0 ? (
                <div className="card-grid">
                    {reports.map(report => (
                        <div className="report-card" key={report.id}>
                            <h3 className="report-title">{report.title}</h3>
                            <p><b>Description:</b> {report.description}</p>
                            
                            {/* Informations du stagiaire */}
                            <div className="report-sender-info">
                                <p><strong>Sender Name:</strong> {report.stagiaireFullName}</p>
                                <p><strong>Sender Email:</strong> {report.stagiaireEmail}</p>
                                <p><strong>Team:</strong> {report.teamName || 'Unknown'}</p>
                            </div>
                            
                            {/* Statut et actions */}
                            <div className="report-status">
                                <label><strong>Status:</strong></label>
                                <select 
                                    value={report.status || 'not-set'}
                                    onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                                >
                                    <option value="not-set">Select Status</option>
                                    <option value="validated">Validated</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="in-progress">In Progress</option>
                                </select>
                            </div>

                            {/* Téléchargement du rapport */}
                            <div className="report-download">
                                <a 
                                    href={`data:application/pdf;base64,${report.file}`} 
                                    download={report.fileName}
                                    className="downloadLink"
                                >
                                    <FaDownload className="download-icon" /> {/* Icône de téléchargement */}
                                    Download
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No reports available.</p>
            )}
        </div>
    );
};

export default EmployeeReports;
