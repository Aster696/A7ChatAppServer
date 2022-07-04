const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const UserSchema = new Schema({
    avatar: {
        type: String,
        default: process.env.NO_AVATAR,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true
    },
    contact: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String
    },
    aboutme: {
        type: String
    },
    description: {
        type: String
    },
    gallery: [{
        type: String
    }],
    userStatus: {
        type: Boolean,
        default: false,
        required: true
    },
    authority: {
        type: String,
        default:"user",
        required: true
    },
    status: {
        type: String,
        default: "active",
        required: true
    },
    reports: [{
        type: String
    }],
    requests: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    sendRequest: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'user'
    }],
    messages: [{
        type: Schema.Types.ObjectId,
        ref: 'chat'
    }],
}, {
    timestamps: true
});

UserSchema.pre('save', async function(next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(this.password, salt);
        this.password = await hashPassword;
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.validPassword = async function(password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw error;
    }
}

const UserModel = mongoose.model('user', UserSchema);
module.exports = UserModel;