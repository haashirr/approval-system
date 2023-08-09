/*
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
function LoginComponent({ onLogin }) {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:3006/api/login', { username, password });
    
            if (response.status === 200 && response.data.token) {
                localStorage.setItem('userToken', response.data.token);
                if (response.data.role) {
                    onLogin(response.data.role); // This will set the role in the App component
                }
                navigate('/dashboard'); // Redirect to dashboard using react-router's navigation method
            } else {
                alert(response.data.message);
            }
        } catch (error) {
            console.error("There was an error logging in", error);
            alert("There was an error logging in. Please try again later.");
        }
    };
    

    return (
        <div>
            <h2>Login</h2>
            <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
            />
            <button onClick={handleLogin}>Login</button>
        </div>
    );
}

export default LoginComponent;
*/
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import './LoginComponent.css';
const LoginComponent = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('http://localhost:3006/login', { username, password });
            const token = response.data.token;

            // Store the token securely (localStorage is shown here for simplicity)
            localStorage.setItem('jwtToken', token);

            // Redirect to appropriate dashboard based on user role
            const decodedToken = jwt_decode(token);
            if (decodedToken.role === 'administrator') {
                navigate('/dashboard/admin');
            } else if (decodedToken.role === 'requester') {
                navigate('/dashboard/requester');
            } else if (decodedToken.role === 'approver') {
                navigate('/dashboard/approver');
            }
        } catch (error) {
            console.error('Login error:', error);
            // Handle error here
        }
    };

    return (
        <div>
            <div className="login-container">
                <h1>Welcome to Motorq Approval System!</h1>
                <h2>Login with your credentials below</h2>
            <input className="input-field" type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
            <input className="input-field" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <button className="login-button" onClick={handleLogin}>Login</button>
        </div>
        </div>
    );
};

export default LoginComponent;
