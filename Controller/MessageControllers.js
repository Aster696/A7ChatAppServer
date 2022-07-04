const createError = require('http-errors');
const UserModel = require('../Models/UserModel');
const MessageModel = require('../Models/MessageModel');
const { default: mongoose } = require('mongoose');
const fs = require('fs');

module.exports = {
    sendMessage: async(req, res, next) => {
        try {
            const mess = req.body;
            const user = await UserModel.findById(mess.userId);
            if(!user) throw createError.NotFound('user not found');
            const friend = await UserModel.findById(mess.friendId);
            if(!friend) throw createError.NotFound('friend not found');
            const chat = new MessageModel(mess);
            const saveChat = await chat.save();
            user.messages.push(saveChat);
            await UserModel.findByIdAndUpdate(user._id, {messages: user.messages}, {new: true});
            friend.messages.push(saveChat);
            await UserModel.findByIdAndUpdate(friend._id, {messages: friend.messages}, {new: true});
            res.status(200).send(saveChat);
            return;
        } catch (error) {
            // console.log(error);
            next(error);
            return;
        }
    },
    displayMessages: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const user = await UserModel.findById(userId).populate('messages');
            if(!user) throw createError.NotFound('user not found');
            return res.status(200).send(user.messages);
        } catch (error) {
            console.log(error)
            if(error instanceof mongoose.CastError) {
                return next(createError.BadRequest('Invalid Id'));
            }
            next(error);
            return;
        }
    },
    updateMessage: async(req, res, next) => {
        try {
            console.log('hello');
        } catch (error) {
            if(error instanceof mongoose.CastError) {
                return next(createError.BadRequest('Invalid Id'));
            }
            next(error);
            return;
        }
    },
    deleteMessage: async(req, res, next) => {
        try {
            console.log('hello');
        } catch (error) {
            if(error instanceof mongoose.CastError) {
                return next(createError.BadRequest('Invalid Id'));
            }
            next(error);
            return;
        }
    },
}