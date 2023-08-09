/*
const dotenv = require('dotenv');
dotenv.config();
console.log("JWT Secret:", process.env.JWT_SECRET_KEY);

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { User } = require('./model');
const app = express();

// Mongoose Connection
mongoose.connect('mongodb://localhost:27017/approvalSystem', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('Connected to MongoDB');

    // Seed users only after a successful connection
    const users = [
        { username: 'admin1', password: 'adminpass', role: 'administrator' },
        { username: 'requester1', password: 'requestpass', role: 'requester' },
        { username: 'approver1', password: 'approvepass', role: 'approver' },
        // ... add more users as needed
    ];

    return User.insertMany(users); // Return the promise to chain then
})
.then(() => {
    console.log("Users seeded!");
})
.catch(err => {
    console.error('Error connecting to MongoDB or seeding:', err);
    // Consider exiting the process if there's a DB connection error or seeding error
    process.exit(1);
});

app.use(bodyParser.json());
app.use(cors({
    origin: 'http://localhost:3007', // the React frontend URL
    credentials: true
}));


const routes = require('./routes');
app.use('/api', routes);

const port = 3006;

app.get('/', (req, res) => {
    res.send('Hello, this is the approval system API!');
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
*/
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Use middleware
app.use(cors());
app.use(bodyParser.json());

// Sample user data (replace with your actual user data)
const users = [
    { username: 'admin1', password: 'adminpass', role: 'administrator' },
    { username: 'requester1', password: 'requestpass', role: 'requester' },
    { username: 'approver1', password: 'approvepass', role: 'approver' }
];

// Placeholder for workflows

const workflows = [];

const notifications = [];  // Store notifications here


// Secret key for JWT
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// New endpoint to handle workflow creation
app.post('/api/workflows/request', (req, res) => {
    const { name, description, approvalType } = req.body;

    if (!name || !description || !approvalType) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    // In a real-world scenario, you'd be saving this to a database.
    // For this example, we'll just use an in-memory array.
    const newWorkflow = {
        id: workflows.length + 1,
        name,
        description,
        approvalType
    };
    workflows.push(newWorkflow);

    return res.status(201).json({ message: 'Workflow created successfully!' });
});
const workflowRequests = [];

// Endpoint to handle workflow requests by a requester
app.post('/api/workflows/submit', (req, res) => {
    const { workflowType, description, attachments } = req.body;

    // Use server-side timestamp generation
    const timestamp = new Date().toISOString();

    // Assuming you can extract the username from an authenticated user's context
    // For this example, let's assume the user's name is hardcoded (replace this with the appropriate mechanism to retrieve the username)
    const username = "exampleUser"; 

    if (!workflowType || !description) {
        return res.status(400).json({ message: 'WorkflowType and description are required!' });
    }

    const isValidTimestamp = !isNaN(Date.parse(timestamp));

    const newRequest = {
        id: workflowRequests.length + 1,
        username,
        workflowType,
        description,
        attachments: attachments || [],
        timestamp,
        needsReview: true
        ,
        status: 'active'
    };
    
    workflowRequests.push(newRequest);
   
console.log("Current workflowRequests:", workflowRequests);
approvers.forEach(approver => {
    notifications.push({
        id: notifications.length + 1,
        username: approver.username,
        message: `New request initiated by ${newRequest.username}`,
        status: 'unread',
        requestId: newRequest.id
    });
});
io.emit('new-notification', { notification: `New request initiated by ${newRequest.username}` });
    return res.status(201).json({ message: 'Workflow request submitted successfully!' });
    // Emit the event after the notifications are created

});


// Endpoint to retrieve list of requests initiated by a specific user
app.get('/api/workflows/requests/:username', (req, res) => {
    const { username } = req.params;

    const userRequests = workflowRequests.filter(request => request.username === username);
    return res.json(userRequests);
});
const approvers = [
    { username: 'approver1', email: 'approver1@email.com' },
    //... other approvers
];
app.get('/api/workflows/pending-requests', (req, res) => {
    console.log(workflowRequests); // Log the entire array
    const pendingRequests = workflowRequests.filter(req => req.status === 'active' && req.needsReview);
    res.json(pendingRequests);
});



app.put('/api/workflows/justify/:id', (req, res) => {
    const requestId = parseInt(req.params.id);
    const request = workflowRequests.find(req => req.id === requestId);

    if (request) {
        request.status = 'justificationRequired';
        request.justification = req.body.justification; // Store justification text
        
        // Send notification to requester
        notifications.push({
            id: notifications.length + 1,
            username: request.username,
            message: `Your request with ID ${request.id} requires justification`,
            status: 'unread',
            requestId: request.id
        });
        io.emit('new-notification', { notification: `Request with ID ${request.id} requires justification` });
        res.json({ message: 'Request moved to justification required step' });
    } else {
        res.status(404).json({ message: 'Request not found' });
    }
});

app.put('/api/workflows/approve/:id', (req, res) => {
    const requestId = parseInt(req.params.id);
    const request = workflowRequests.find(req => req.id === requestId);

    if (request) {
        request.status = 'approved';
        
        // Send notification to requester
        notifications.push({
            id: notifications.length + 1,
            username: request.username,
            message: `Your request with ID ${request.id} has been approved`,
            status: 'unread',
            requestId: request.id,
            approvalStatus: 'approved'  // Include the approval status
        });
        
        // Emit the event after the notification is created
        io.emit('new-notification', { notification: `Request with ID ${request.id} has been approved` });
        
        res.json({ message: 'Request approved successfully' });
    
    } else {
        res.status(404).json({ message: 'Request not found' });
    }
});

app.put('/api/workflows/reject/:id', (req, res) => {
    const requestId = parseInt(req.params.id);
    const request = workflowRequests.find(req => req.id === requestId);

    if (request) {
        request.status = 'rejected';
        
        // Send notification to requester
        notifications.push({
            id: notifications.length + 1,
            username: request.username,
            message: `Your request with ID ${request.id} has been rejected`,
            status: 'unread',
            requestId: request.id,
            approvalStatus: 'rejected'  // Include the approval status
        });
        io.emit('new-notification', { notification: `Request with ID ${request.id} has been rejected` });
        res.json({ message: 'Request rejected successfully' });
    } else {
        res.status(404).json({ message: 'Request not found' });
    }
});



app.post('/initiate-request', (req, res) => {
    // ... Your logic to initiate a request

    // Now send notifications
    approvers.forEach(approver => {
        // For now, we just log it
        console.log(`Notification sent to ${approver.username}`);
        // In a real-world scenario, you might want to send an email, or update a database entry for in-app notifications.
    });
});
app.get('/api/workflows/all-requests', (req, res) => {
    res.json(workflowRequests);
});
app.put('/api/workflows/update/:id', (req, res) => {
    const requestId = parseInt(req.params.id);
    const { description } = req.body;
    
    const request = workflowRequests.find(req => req.id === requestId);

    if (request) {
        if (request.status !== 'justificationRequired') {
            return res.status(400).json({ message: 'Only requests needing justification can be updated.' });
        }
        
        request.description = description;
        request.status = 'active';  // Changing status back to active
        res.json({ message: 'Request updated and resubmitted successfully!' });
    } else {
        res.status(404).json({ message: 'Request not found' });
    }
});

app.get('/api/notifications/:username', (req, res) => {
    const { username } = req.params;
    const userNotifications = notifications.filter(n => n.username === username);
    res.json(userNotifications);
});

app.put('/api/notifications/:id/read', (req, res) => {
    const notificationId = parseInt(req.params.id, 10);
    const notification = notifications.find(n => n.id === notificationId);

    if (notification) {
        notification.status = 'read';
        res.json({ message: 'Notification marked as read' });
    } else {
        res.status(404).json({ message: 'Notification not found' });
    }
});
// Endpoint to get the total number of pending workflows
app.get('/api/workflows/stats/pending', (req, res) => {
    const pendingCount = workflowRequests.filter(req => req.status === 'active').length;
    res.json({ count: pendingCount });
});

// Utility function to filter requests based on time frame
const filterRequestsByTime = (timeFrame) => {
    const now = new Date();
    return workflowRequests.filter(request => {
        const requestDate = new Date(request.timestamp);
        switch (timeFrame) {
            case 'today':
                return requestDate.toDateString() === now.toDateString();
            case 'thisWeek':
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6:1));  // Get Monday of this week
                return requestDate >= startOfWeek;
            case 'thisMonth':
                return requestDate.getMonth() === now.getMonth() && requestDate.getFullYear() === now.getFullYear();
            default:
                return false;
        }
    });
};

// Endpoint to get the total number of approved workflows within a specific time frame
app.get('/api/workflows/stats/approved/:timeFrame', (req, res) => {
    const timeFrame = req.params.timeFrame;
    const approvedRequests = filterRequestsByTime(timeFrame).filter(req => req.status === 'approved');
    res.json({ count: approvedRequests.length });
});

// Endpoint to get the total number of rejected workflows within a specific time frame
app.get('/api/workflows/stats/rejected/:timeFrame', (req, res) => {
    const timeFrame = req.params.timeFrame;
    const rejectedRequests = filterRequestsByTime(timeFrame).filter(req => req.status === 'rejected');
    res.json({ count: rejectedRequests.length });
});

http.listen(3006, () => {
    console.log('Server is running on port 3006');
});
