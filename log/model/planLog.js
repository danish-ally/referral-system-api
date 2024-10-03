const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const planLog = new Schema({
    planDetails: {
        type: Object,
        required: true
    },
    changedBy: {
        userId: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    changedAt: {
        type: Date,
        default: Date.now,
        required: true
    }

}, { timestamps: true });

const PlanLog = mongoose.model('planLog', planLog);

module.exports = PlanLog;

