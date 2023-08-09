import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CreateWorkflow.css';

// Create an instance of Axios with the authorization header
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3006/api', // Update with your API endpoint
    headers: {
        Authorization: `Bearer ${localStorage.getItem('userToken')}`
    }
});

const CreateWorkflow = (props) => {
    const [name, setName] = useState('');
    const [approvalType, setApprovalType] = useState('everyone');
    const [approvers, setApprovers] = useState([]);
    const [allApprovers, setAllApprovers] = useState([]);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchApprovers = async () => {
            try {
                const response = await axiosInstance.get('/users?role=approver'); 
                setAllApprovers(response.data);
            } catch (error) {
                console.error("Error fetching approvers:", error);
            }
        }

        fetchApprovers();
    }, []);

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        if (name === "name") setName(value);
        else if (name === "approvalType") setApprovalType(value);
        // Add other input fields as needed
    }

    const handleApproverChange = (event) => {
        const approverId = event.target.value;
        let newApprovers = [...approvers];

        if (event.target.checked) {
            newApprovers.push(approverId);
        } else {
            newApprovers = newApprovers.filter(id => id !== approverId);
        }

        setApprovers(newApprovers);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        const workflowData = {
            name: name,
            approval_type: approvalType,
            approvers: approvers
        };

        try {
            const response = await axiosInstance.post('/workflows', workflowData); 
            setMessage("Workflow successfully created!");
            props.onWorkflowCreated(response.data);

        } catch (error) {
            setMessage("Error creating workflow. Please try again.");
            console.error("Error creating workflow:", error);
        }
    }


    return (
        <div>
            <h2>Create Workflow</h2>
            <form onSubmit={handleSubmit}>
                {/* ... other input fields ... */}
                <div>
                    <label>Name: </label>
                    <input type="text" name="name" value={name} onChange={handleInputChange} />
                </div>
                <div>
                    <label>Approval Type: </label>
                    <select name="approvalType" value={approvalType} onChange={handleInputChange}>
                        <option value="everyone">Everyone</option>
                        {/* Add other options as needed */}
                    </select>
                </div>
                <div>
                    <label>Approvers: </label>
                    {allApprovers.map(approver => (
                        <div key={approver._id}>
                            <input
                                type="checkbox"
                                value={approver._id}
                                onChange={handleApproverChange}
                            />
                            {approver.username}
                        </div>
                    ))}
                </div>

                <div>
                    <button type="submit">Create Workflow</button>
                </div>
            </form>

            {message && 
                <div className={message.includes("Error") ? "errorFeedback" : "successFeedback"}>
                    {message}
                </div>
            }
        </div>
    );
}

export default CreateWorkflow;
