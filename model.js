const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// User Model
const userSchema = new Schema({
    username: String,
    password: String, // Note: For real-world scenarios, hash the password with bcrypt or similar.
    role: { type: String, enum: ['requester', 'approver', 'administrator'] },
});

const User = mongoose.model('User', userSchema);

// Workflow Model
const workflowSchema = new Schema({
    name: { type: String, unique: true },
    approval_type: { type: String, enum: ['everyone', 'at_least_two', 'anyone'] },
    approvers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

const Workflow = mongoose.model('Workflow', workflowSchema);

// Request Model
const requestSchema = new Schema({
    requester: { type: Schema.Types.ObjectId, ref: 'User' },
    workflow: { type: Schema.Types.ObjectId, ref: 'Workflow' },
    description: String,
    attachments: [String], // Holds paths to attachments. Another model for Attachments can be used for complex scenarios.
    status: { type: String, enum: ['active', 'approved', 'rejected','justificationRequired'], default: 'active' },
    comments: [{
        by: { type: Schema.Types.ObjectId, ref: 'User' },
        content: String,
        date: { type: Date, default: Date.now }
    }]
});

const Request = mongoose.model('Request', requestSchema);

module.exports = {
    User,
    Workflow,
    Request
};

