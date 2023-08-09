/*
import React from 'react';
import LoginComponent from './LoginComponent';
import AdminDashboard from './AdminDashboard';
import RequesterView from './RequesterView';
import ApproverView from './ApproverView';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('userToken'))
    const [userRole, setUserRole] = useState(''); // 'admin', 'requester', or 'approver'
   
    useEffect(() => {
      const fetchUserRole = async () => {
          if(loggedIn) {
              // Extract the token from localStorage into a constant
              const token = localStorage.getItem('userToken');
  
              // Make sure there's a token before proceeding
              if(!token) {
                  console.error("Token not found in localStorage");
                  return;
              }
  
              try {
                console.log(`Token: Bearer ${localStorage.getItem('userToken')}`);

                  const response = await axios.get('http://localhost:3006/api/user/details', {
                      headers: {
                          Authorization: `Bearer ${token}`  // Use the token here
                      }
                  });
  
                  if(response.status === 200) {
                      setUserRole(response.data.role);
                  }
              } catch (error) {
                  console.error("Error fetching user details:", error);
              }
          }
      };
      
      fetchUserRole();
  }, [loggedIn]);
  
    const handleLogin = () => {
     
        setLoggedIn(true);
        console.log("Logged in:", loggedIn, "User Role:", userRole);
   
    
  
    
    };

    const renderView = () => {
        if (!loggedIn) return <LoginComponent onLogin={handleLogin} />;

        switch (userRole) {
            case 'admin':
                return <AdminDashboard />;
            case 'requester':
                return <RequesterView />;
            case 'approver':
                return <ApproverView />;
            default:
                return <p>Invalid role</p>;
        }
    };

    return (
      <Router>
        <div className="App">
            <header className="App-header">
                <h1>Approval System</h1>
            </header>
            <main>
                <Routes>
                    <Route path="/" element={<LoginComponent onLogin={handleLogin} />} />
                    <Route path="/dashboard" element={<>{renderView()}</>} />
                    <Route path="/request" component={RequesterView} />
                  
                </Routes>
            </main>
        </div>
      </Router>
    );
    
}

export default App;

*/
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginComponent from './LoginComponent';
import AdminDashboard from './AdminDashboard';
import RequesterDashboard from './RequesterDashboard'; 
import ApproversDashboard from './ApproversDashboard';  // Import ApproversDashboard
import AuditPage from './AuditPage';  // Import AuditPage

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/" element={<LoginComponent />} />
                    <Route path="/dashboard/admin" element={<AdminDashboard />} />
                    <Route path="/dashboard/requester" element={<RequesterDashboard />} />
                    <Route path="/dashboard/approver" element={<ApproversDashboard />} />
                    <Route path="/audit" element={<AuditPage />} />  // Route for AuditPage
                </Routes>
            </div>
        </Router>
    );
}

export default App;
