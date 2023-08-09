/*
import React, { useState } from 'react';
import axios from 'axios';

function RequesterView() {
    const [requestDescription, setRequestDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmitRequest = async (e) => {
        e.preventDefault();  // prevent the default form behavior

        // Validate request content
        if (!requestDescription.trim()) {
            setMessage("Please enter some details for the request.");
            return;
        }

        setLoading(true);
        setMessage('Submitting your request...');

        const token = localStorage.getItem('userToken'); // Updated the key based on previous context
        const userId = localStorage.getItem('userId');   // Assuming the user ID is stored in localStorage too

        if (!token || !userId) {
            setMessage("Authentication error. Please login again.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('/api/requests',
                {
                    requester: userId,
                    description: requestDescription,
                    // Additional data can be added as needed
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.status === 201) {
                setMessage("Your request has been submitted successfully!");
                setRequestDescription('');  // Clear the request input
            } else {
                setMessage("Unexpected response when trying to submit the request.");
            }
        } catch (error) {
            setMessage("Error submitting request. Please try again later.");
            console.error("Error submitting request:", error);
        }

        setLoading(false);
    }

    return (
        <div>
            <h2>Create Request</h2>
            <form onSubmit={handleSubmitRequest}>
                <textarea
                    value={requestDescription}
                    onChange={e => setRequestDescription(e.target.value)}
                    placeholder="Enter your request details"
                ></textarea>
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}

export default RequesterView;

*/
// RequesterDashboard.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './RequesterDashboard.css';

const RequesterDashboard = () => {
    const [workflowType, setWorkflowType] = useState('');
    const [description, setDescription] = useState('');
    const [attachments, setAttachments] = useState([]);
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState('');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [justificationMode, setJustificationMode] = useState(false);
    const [justificationText, setJustificationText] = useState('');
    const [notifications, setNotifications] = useState([]);

    const handleSubmitRequest = async () => {
        try {
            const response = await axios.post('/api/workflows/submit', {
                username: 'requester1',
                workflowType,
                description,
                attachments
            });
            setMessage(response.data.message);
            fetchRequestsAndNotifications();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error submitting request');
        }
    };

    const fetchRequestsAndNotifications = async () => {
        // Fetching requests
        try {
            const requestsResponse = await axios.get(`/api/workflows/requests/requester1`);
            setRequests(requestsResponse.data);
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error fetching requests');
        }

        // Fetching notifications
        try {
            const notificationsResponse = await axios.get(`/api/notifications/requester1`);
            setNotifications(notificationsResponse.data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchRequestsAndNotifications();

        // Set up socket connection
        const socket = io('http://localhost:3006');  // Ensure the URL matches your server

        // Listen for real-time notifications
        socket.on('new-notification', (data) => {
            setNotifications(prevNotifications => [data.notification, ...prevNotifications]);
        });

        // Set up polling every 10 seconds
        const intervalId = setInterval(fetchRequestsAndNotifications, 10000);

        // Clean up the socket and interval upon unmounting
        return () => {
            clearInterval(intervalId);
            socket.disconnect();
        };
    }, []);

    const handleSubmitWithJustification = async () => {
        try {
            const response = await axios.post('/api/workflows/submit', {
                username: 'requester1',
                workflowType: selectedRequest.workflowType,
                description: selectedRequest.description,
                attachments,
                justification: justificationText
            });
            setMessage(response.data.message);
            fetchRequestsAndNotifications();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error submitting request');
        }
    };

    const handleFileChange = (e) => {
        setAttachments([e.target.files[0]]);
    };

    return (
        <div className="dashboard-containerr">
            <h1>Welcome Requester!</h1>
            <h2>Submit a Workflow Request</h2>
            <select value={workflowType} onChange={(e) => setWorkflowType(e.target.value)}>
                <option value="">Select Workflow Type</option>
                <option value="reimbursement">Reimbursement</option>
                <option value="leave">Leave</option>
            </select>
            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleSubmitRequest}>Submit</button>
            <h2>Your Requests</h2>
            <ul>
                {requests.map(req => (
                    <li key={req.id}>
                        {req.workflowType} - {req.description} - {req.status}
                    </li>
                ))}
            </ul>
            {message && <p>{message}</p>}
            <h2>Your Notifications</h2>
            <ul>
                {notifications.map(notification => (
                    <li key={notification.id}>
                        {notification.message} - {notification.approvalStatus} - {notification.status}
                    </li>
                ))}
            </ul>
            {selectedRequest && selectedRequest.status === 'justificationRequired' && !justificationMode && (
                <button onClick={() => setJustificationMode(true)}>Provide More Details</button>
            )}
            {selectedRequest && selectedRequest.status === 'justificationRequired' && justificationMode && (
                <div>
                    <h3>Add Justification</h3>
                    <textarea
                        value={justificationText}
                        onChange={(e) => setJustificationText(e.target.value)}
                        placeholder="Add more details here..."
                    ></textarea>
                    <button onClick={handleSubmitWithJustification}>Submit with Justification</button>
                </div>
            )}
        </div>
    );
};

export default RequesterDashboard;
