/*
const express = require('express');
const { User, Workflow, Request, Notification } = require('./model');
const jwt = require('jsonwebtoken'); // Assuming you'll use JSON Web Tokens for authentication

const router = express.Router();
// Middleware for Authentication
function authenticateJWT(req, res, next) {
    const token = req.headers.authorization;
    console.log("Received Token:", token);
    if (!token) {
       
        return res.sendStatus(403);  // Forbidden
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Forbidden
            console.log("JWT verification error:", err);

        }
        console.log("Decoded JWT User:", user);
        req.user = user;
        next();
    });
}

// Middleware for Authorization (Admin Role)
function authorizeAdmin(req, res, next) {
    if (req.user.role !== 'administrator') {
        return res.status(403).json({ message: 'User is not authorized' });
    }

    next();
}
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Find user by username
        const user = await User.findOne({ username });

        // If user not found or password is incorrect, throw an error
        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        
        
        // Generate a token. For simplicity, let's use JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET_KEY, // You should keep this secret and preferably in an environment variable
            { expiresIn: '1h' } // Token expiry time
        );

        res.status(200).json({ token, userId: user._id, role: user.role });

    } catch (error) {
        res.status(500).json({ message: "Error during login.", error: error.message });
    }
});

router.post('/workflows', async (req, res) => {
    try {
        const workflow = new Workflow(req.body); // Assuming body contains valid workflow details
        await workflow.save();
        res.status(201).json({ message: "Workflow created!", data: workflow });
    } catch (error) {
        res.status(500).json({ message: "Error creating workflow.", error: error.message });
    }
});
router.get('/workflows', async (req, res) => {
    try {
        const workflows = await Workflow.find();
        res.status(200).json(workflows);
    } catch (error) {
        res.status(500).json({ message: "Error fetching workflows.", error: error.message });
    }
});

router.get('/user/details', authenticateJWT, async (req, res) => {
    try {
        // req.user.userId was set by the authenticateJWT middleware
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Return user details but without sensitive info like password
        const userDetails = {
            id: user._id,
            username: user.username,
            role: user.role
        };

        res.status(200).json(userDetails);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user details.", error: error.message });
    }
});


router.post('/requests', authenticateJWT, async (req, res) => {
    try {
        const userId = req.user.userId;

        // Create the request and associate it with the logged-in user (requester)
        const request = new Request({
            ...req.body,
            requester: userId
        });
        
        await request.save();

        const workflow = await Workflow.findById(request.workflow);
        
        for (let approverId of workflow.approvers) {
            const notification = new Notification({
                recipient: approverId,
                request: request._id,
                message: "You have a new request pending for approval."
            });
            await notification.save();
        }

        res.status(201).json({ message: "Request created and notifications sent!", data: request });
    } catch (error) {
        res.status(500).json({ message: "Error creating request.", error: error.message });
    }
});

router.get('/approver/:approverId/requests', async (req, res) => {
    try {
        const approverId = req.params.approverId;
        
        const workflows = await Workflow.find({ approvers: approverId });
        const workflowIds = workflows.map(w => w._id);

        const pendingRequests = await Request.find({ 
            workflow: { $in: workflowIds }, 
            status: "active" 
        });

        res.status(200).json(pendingRequests);
    } catch (error) {
        res.status(500).json({ message: "Error fetching requests.", error: error.message });
    }
});

module.exports = router;
*/
const express = require('express');
const { User } = require('./model');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || user.password !== password) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, userId: user._id, role: user.role });

    } catch (error) {
        res.status(500).json({ message: 'Error during login', error: error.message });
    }
});

module.exports = router;
