const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const boolean = require('@hapi/joi/lib/types/boolean');

const MessageSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    friendId: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    friendName: {
        type: String,
        required: true
    },
    message: {
        type: String
    },
    gallery: [{
        type: String
    }],
    video: [{
        type: String
    }],
    status: {
        type: boolean,
        default: true
    },
}, {
    timestamps: true
});

const MessageModel = mongoose.model('chat', MessageSchema);
module.exports = MessageModel;