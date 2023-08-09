// AuditPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AuditPage.css'; 

const AuditPage = () => {
    const [auditData, setAuditData] = useState([]);

    useEffect(() => {
        const fetchAuditData = async () => {
            try {
                const response = await axios.get('/api/workflows/history');
                setAuditData(response.data);
            } catch (error) {
                console.error('Error fetching audit data:', error);
            }
        };

        fetchAuditData();
    }, []);

    return (
        <div className="audit-container">
            <h2>Audit Page</h2>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Approval Type</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {auditData.map((workflow, index) => (
                        <tr key={index}>
                            <td>{workflow.name}</td>
                            <td>{workflow.description}</td>
                            <td>{workflow.approvalType}</td>
                            <td>{workflow.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};



export default AuditPage;
