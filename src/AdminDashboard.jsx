/*
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateWorkflow from './CreateWorkflow'; // Import the CreateWorkflow component

// Create an instance of Axios with the authorization header
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3006/api', // Update with your API endpoint
    headers: {
        Authorization: `Bearer ${localStorage.getItem('userToken')}`
    }
});

function AdminDashboard() {
    const [workflows, setWorkflows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorkflows = async () => {
            try {
                const response = await axiosInstance.get('/workflows'); // Use the axiosInstance

                if (response.status === 200) {
                    setWorkflows(response.data);
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching workflows:", error);
                alert("Failed to fetch workflows. Please try again.");
                setLoading(false);
            }
        };

        fetchWorkflows();
    }, []);

    const createWorkflow = async () => {
        // Logic to create a new workflow. You'll need to adapt this to your backend API.
        try {
            const response = await axios.post('/api/workflows', {
                // ... data for the new workflow (e.g. name, approvers, etc.)
            });
            if (response.status === 201) {
                alert("Workflow created successfully");
                // Add the new workflow to the state so it displays immediately
                setWorkflows(prevWorkflows => [...prevWorkflows, response.data]);
            }
        } catch (error) {
            console.error("Error creating workflow:", error);
            alert("Failed to create workflow. Please try again.");
        }
    }
    const onWorkflowCreated = (newWorkflow) => {
        setWorkflows(prevWorkflows => [...prevWorkflows, newWorkflow]);
    };
    return (
        <div>
            <h2>Admin Dashboard</h2>
            {loading ? (
                <p>Loading workflows...</p>
            ) : (
                <div>
                    <h3>Current Workflows:</h3>
                    {workflows.length === 0 ? (
                        <p>No workflows found.</p>
                    ) : (
                        <ul>
                            {workflows.map(workflow => (
                                <li key={workflow.id}>{workflow.name}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
            <h3>Create New Workflow</h3>

          
            <CreateWorkflow onWorkflowCreated={onWorkflowCreated} />
        </div>
    );
}


export default AdminDashboard;
*/
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';  // Importing our CSS
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    const [workflowName, setWorkflowName] = useState('');
    const [workflowDescription, setWorkflowDescription] = useState('');
    const [approvalType, setApprovalType] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [pendingWorkflows, setPendingWorkflows] = useState(0);
    const [approvedStats, setApprovedStats] = useState({ month: 0, week: 0, today: 0 });
    const [rejectedStats, setRejectedStats] = useState({ month: 0, week: 0, today: 0 });
    const [pendingCount, setPendingCount] = useState(0);
    const [approvedTodayCount, setApprovedTodayCount] = useState(0);
    const [approvedThisWeekCount, setApprovedThisWeekCount] = useState(0);
    const [approvedThisMonthCount, setApprovedThisMonthCount] = useState(0);
    const [rejectedTodayCount, setRejectedTodayCount] = useState(0);
    const [rejectedThisWeekCount, setRejectedThisWeekCount] = useState(0);
    const [rejectedThisMonthCount, setRejectedThisMonthCount] = useState(0);
    // Fetch statistics on component mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const pendingResponse = await axios.get('/api/workflows/stats/pending');
                const approvedTodayResponse = await axios.get('/api/workflows/stats/approved/today');
                const approvedThisWeekResponse = await axios.get('/api/workflows/stats/approved/thisWeek');
                const approvedThisMonthResponse = await axios.get('/api/workflows/stats/approved/thisMonth');
                const rejectedTodayResponse = await axios.get('/api/workflows/stats/rejected/today');
                const rejectedThisWeekResponse = await axios.get('/api/workflows/stats/rejected/thisWeek');
                const rejectedThisMonthResponse = await axios.get('/api/workflows/stats/rejected/thisMonth');

                setPendingCount(pendingResponse.data.count);
                setApprovedTodayCount(approvedTodayResponse.data.count);
                setApprovedThisWeekCount(approvedThisWeekResponse.data.count);
                setApprovedThisMonthCount(approvedThisMonthResponse.data.count);
                setRejectedTodayCount(rejectedTodayResponse.data.count);
                setRejectedThisWeekCount(rejectedThisWeekResponse.data.count);
                setRejectedThisMonthCount(rejectedThisMonthResponse.data.count);
            } catch (error) {
                setErrorMessage('Error fetching workflow statistics');
            }
        };

        fetchStats();  // Call immediately on mount
        const interval = setInterval(fetchStats, 10000);  // Poll every 10 seconds

        return () => clearInterval(interval);  // Clear the interval on component unmount

    }, []);

    const handleWorkflowCreation = async () => {
        try {
            const response = await axios.post('/api/workflows/request', {
                name: workflowName,
                description: workflowDescription,
                approvalType: approvalType // Add the selected approval type
            });
    
            setSuccessMessage(response.data.message);
            setErrorMessage('');
            setWorkflowName('');
            setWorkflowDescription('');
            setApprovalType('');
        } catch (error) {
            setErrorMessage('Error creating workflow');
            setSuccessMessage('');
        }
    };
    

    return (
       

        <div className="dashboard-container">
            <Link to="/audit">View Audit</Link>

            <h1>Hello Administrator!</h1>
             <h2>Dashboard</h2>
             
            <div className="stats-container">
                <h3>Workflow Statistics</h3>
                <p>Total pending workflows: {pendingCount}</p>
                <p>Total approved today: {approvedTodayCount}</p>
                <p>Total approved this week: {approvedThisWeekCount}</p>
                <p>Total approved this month: {approvedThisMonthCount}</p>
                <p>Total rejected today: {rejectedTodayCount}</p>
                <p>Total rejected this week: {rejectedThisWeekCount}</p>
                <p>Total rejected this month: {rejectedThisMonthCount}</p>
            </div>
            
            <div className="creation-container">
                <h3>Create Workflow</h3>
                <input
                    type="text"
                    placeholder="Workflow Name"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                />
                <textarea
                    placeholder="Workflow Description"
                    value={workflowDescription}
                    onChange={(e) => setWorkflowDescription(e.target.value)}
                />
                <select value={approvalType} onChange={(e) => setApprovalType(e.target.value)}>
                    <option value="">Select Approval Type</option>
                    <option value="everyone">Everyone should approve</option>
                    <option value="at_least_two">At least two should approve</option>
                    <option value="anyone">Anyone can approve</option>
                </select>
                <button onClick={handleWorkflowCreation}>Create Workflow</button>
            </div>
            
            <div className="feedback-container">
                {successMessage && <p className="success-message">{successMessage}</p>}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
};

export default AdminDashboard;