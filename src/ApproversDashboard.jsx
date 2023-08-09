import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ApproversDashboard.css';


const ApproversDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        axios.get('/api/workflows/pending-requests')
            .then(response => {
                setRequests(response.data);
            })
            .catch(error => {
                console.error("Error fetching pending requests:", error);
            });
    }, []);
    {selectedRequest && selectedRequest.status === 'justificationRequired' && (
        <div>
            <h3>Review Request</h3>
            <p>{selectedRequest.description}</p>
            <p>Justification: {selectedRequest.justification}</p>
            <button onClick={handleApprove}>Approve</button>
            <button onClick={handleReject}>Reject</button>
        </div>
    )}
    
    const handleRequestSelection = (request) => {
        setSelectedRequest(request);
    };
    const [message, setMessage] = useState(null);
    const handleApprove = () => {
        axios.put(`/api/workflows/approve/${selectedRequest.id}`)
            .then(response => {
                setRequests(prevRequests => prevRequests.filter(req => req.id !== selectedRequest.id));
                setSelectedRequest(null);
                setMessage("Request approved successfully!");  // Setting the message here
            })
            .catch(error => {
                console.error("Error approving the request:", error);
            });
    };
    
    const handleReject = () => {
        axios.put(`/api/workflows/reject/${selectedRequest.id}`)
            .then(response => {
                setRequests(prevRequests => prevRequests.filter(req => req.id !== selectedRequest.id));
                setSelectedRequest(null);
                setMessage("Request rejected successfully!");  // Setting the message here
            })
            .catch(error => {
                console.error("Error rejecting the request:", error);
            });
    };
    const handleJustify = () => {
        axios.put(`/api/workflows/justify/${selectedRequest.id}`)
            .then(response => {
                // Remove the request from local state or refetch requests
                setRequests(prevRequests => prevRequests.filter(req => req.id !== selectedRequest.id));
                setSelectedRequest(null);  // Clear selected request
                setMessage("Request send for justification!");
            })
            .catch(error => {
                console.error("Error moving the request to justification:", error);
            });
    };
    
    const isValidDate = (dateString) => {
        const timestamp = Date.parse(dateString);
        return !isNaN(timestamp);
    };
    
   

    return (
        <div className="dashboard-containerrr">
            <h2>Pending Requests</h2>
            {message && <div className="message">{message}</div>}  // Displaying the message here
            <ul>
    {requests.map(request => (
        <li 
            key={request.id} 
            onClick={() => handleRequestSelection(request)}
            style={{ backgroundColor: !isValidDate(request.timestamp) ? 'lightcoral' : 'inherit' }}
        >
            {request.description} - {new Date(request.timestamp).toLocaleString()}
        </li>
    ))}
</ul>


            {selectedRequest && (
               
                <div>
                    <h3>Review Request</h3>
                    <p>{selectedRequest.description}</p>
                    <button onClick={handleApprove}>Approve</button>
                    <button onClick={handleReject}>Reject</button>
                    <button onClick={handleJustify}>Justify</button>
                </div>
            )}
            

        </div>
    );
};

export default ApproversDashboard;

