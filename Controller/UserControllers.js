const createError = require('http-errors');
const UserModel = require('../Models/UserModel');
const { SignAccessToken, forgotPasswordToken } = require('../Helpers/Genrate_jwt');
const { registerValidation, loginValidation } = require('../Helpers/ValidationSchema');
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');

module.exports = {
    register: async(req, res, next) => {
        // console.log(req.body);
        try {
            const result = await registerValidation.validateAsync(req.body);
            const doExit = await UserModel.findOne({email: result.email});
            if(doExit) throw createError.Conflict('User already exist');
            
            const user = new UserModel(result);
            user.avatar = process.env.NO_AVATAR
            await user.save();
            return res.status(201).send(user);
        } catch (error) {
            console.log(error);
            if(error.isJoi === true) error.status = 422;
            next(error);
            return;
        }
    },
    login: async(req, res, next) => {
        try {
            const login = await loginValidation.validateAsync(req.body);
            
            const user = await UserModel.findOne({email: login.email});
            if(!user) throw createError.NotFound('User not found');
            
            const isMatch = await user.validPassword(login.password);
            if(!isMatch) throw createError.Unauthorized('email/ password invalid');

            const updatedUser = await UserModel.findByIdAndUpdate(user._id, {userStatus: true}, {new: true});
            const accessToken = await SignAccessToken(updatedUser.id, updatedUser.avatar, updatedUser.userName, updatedUser.userStatus, updatedUser.authority, updatedUser.status);

            res.status(200).send({accessToken});
            return;
        } catch (error) {
            // console.log(error);
            if(error.isJoi === true) error.status = 422;
            next(error);
            return;
        }
    },
    updateUser: async(req, res, next) => {
        try {
            // console.log(req.body)
            const userId = req.params.id;
            const result = await req.body;
            const user = await UserModel.findByIdAndUpdate(userId, result, {new: true});
            if(!user) throw createError.NotFound("user not found");
            res.status(200).send(user)
            return;
        } catch (error) {
            console.log(error);
            if(error instanceof mongoose.CastError) {
                return next(createError.BadRequest("Invalid id"))
            }
            next(error);
            return;
        }
    },
    deleteUser: async(req, res, next) => {
        try {
            res.status(200).send('delete user successfull');
        } catch (error) {
            console.log(error);
        }
    },
    displayUsers: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const users = await UserModel.find({_id: {$ne: userId}}, {__v: 0}, {new: true});
            res.status(200).send(users);
            return;
        } catch (error) {
            next(error);
            return;
        }
    },
    displayUserById: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const user = await UserModel.findById(userId);
            if(!user) throw createError.NotFound('user not found');
            res.status(200).send(user);
            return;
        } catch (error) {
            if(error instanceof mongoose.CastError){
                return next(createError.BadRequest('User id is invalid'));
            }
            next(error);
            return;
        }
    },
    uploadImgs: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const user = await UserModel.findByIdAndUpdate(userId, {avatar: process.env.AVATAR+userId+"/"+req.file.filename}, {new: true});
            if(!user) throw createError.NotFound("User not found");
            return res.status(200).send(user);
        } catch (error) {
            console.log(error);
            if(error instanceof mongoose.CastError){
                return next(createError.BadRequest('Invalid id'));
            }
            next(error);
            return;
        }
    },
    uploadToUserGallery: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const userGallery = await UserModel.findById(userId);
            if(!userGallery) throw createError.NotFound("User not found");
            for(var i = 0; i < req.files.length; i++) {
                userGallery.gallery.push(process.env.GALLERYS+userId+"/"+req.files[i].filename);
            }
            const user = await UserModel.findByIdAndUpdate(userId, {gallery: userGallery.gallery}, {new: true});
            return res.status(200).send(user);
        } catch (error) {
            console.log(error);
            if(error instanceof mongoose.CastError){
                return next(createError.BadRequest('Invalid id'));
            }
            next(error);
            return;
        }
    },
    deleteUserGalleryImg: async(req, res, next) => {
        try {
            // require('../Files/UserAvatars')
            const userId = req.params.id;
            const gallery = req.body.dummyData;
            const user = await UserModel.findById(userId);
            if(!user) throw createError("user not found");
            const file = gallery.split("http://localhost:5700/");
            fs.unlinkSync(process.env.FULL_USER_FILE_PATH + file.join(""));
            user.gallery.pull(gallery);
            await UserModel.findByIdAndUpdate(user._id, {gallery: user.gallery});
            res.status(204).send(user);
            return
        } catch (error) {
            console.log(error)
            next(error);
            return;
        }
    },
    sendFriendRequest: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const friendReq = req.body;
            const user = await UserModel.findById(userId);
            if(!user) throw createError.NotFound('user not found');
            const friend = await UserModel.findById(friendReq._id);
            if(!friend) throw createError.NotFound('friend not found');
            const requestExist = await UserModel.findOne({_id: user._id, sendRequest: friend});
            if(requestExist) throw createError.Conflict("You have already send friend request");
            const friendExist = await UserModel.findOne({_id: user._id, friends: friend});
            if(friendExist) throw createError.Conflict('Already your friend');
            user.sendRequest.push(friend);
            await UserModel.findByIdAndUpdate(user._id, {sendRequest: user.sendRequest}, {new: true});
            friend.requests.push(user);
            await UserModel.findByIdAndUpdate(friend._id, {requests: friend.requests}, {new: true});
            return res.status(201).send({user, friend});
        } catch (error) {
            if(error instanceof mongoose.CastError){
                return next(createError.BadRequest('Invalid id'));
            }
            next(error);
            return
        }
    },
    displaySendFriendRequests: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const user = await UserModel.findById(userId).populate('sendRequest');
            if(!user) throw createError.NotFound("user not found");
            return res.status(200).send(user.sendRequest);
        } catch (error) {
            if(error instanceof mongoose.CastError){
                return next(createError.BadRequest('Invalid id'));
            }
            next(error);
            return;
        }
    },
    removeSendFriendRequest: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const friendReq = req.body;
            const user = await UserModel.findById(userId);
            if(!user) throw createError.NotFound('user not found');
            const friend = await UserModel.findById(friendReq._id);
            user.sendRequest.pull(friend);
            friend.requests.pull(user);
            await UserModel.findByIdAndUpdate(user._id, {sendRequest: user.sendRequest}, {new: true});
            await UserModel.findByIdAndUpdate(friend._id, {requests: friend.requests}, {new: true})
            return res.status(200).send(user);
        } catch (error) {
            if(error instanceof mongoose.CastError){
                return next(createError.BadRequest('Invalid id'));
            }
            next(error);
            return
        }
    },
    displayFriendRequests: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const user = await UserModel.findById(userId).populate('requests');
            if(!user) throw createError.NotFound("user not found");
            return res.status(200).send(user.requests);
        } catch (error) {
            if(error instanceof mongoose.CastError){
                return next(createError.BadRequest('Invalid id'));
            }
            next(error);
            return;
        }
    },
    removeFriendRequest: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const friend = req.body;
            const user = await UserModel.findById(userId);
            if(!user) throw createError.NotFound('User not found');
            const removeRequest = user.requests.pull(friend);
            if(!removeRequest) throw createError.NotFound('Request not found')
            const updatedUser = await UserModel.findByIdAndUpdate(user._id, {requests: user.requests}, {new: true});
            return res.status(200).send(updatedUser);
        } catch (error) {
            if(error instanceof mongoose.CastError) {
                return next(createError.BadRequest('Invalid Id'));
            }
            next(error);
            return;
        }
    },
    addFriend: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const addFriend = req.body;
            const user = await UserModel.findById(userId);
            if(!user) throw createError.NotFound('user not found'); 
            const friend = await UserModel.findById(addFriend._id);
            if(!friend) throw createError.NotFound('friend not found');
            const friendExist = await UserModel.findOne({_id: user._id, friends: friend});
            if(friendExist) throw createError.Conflict('Already your friend');
            user.friends.push(friend);
            user.sendRequest.pull(friend);
            user.requests.pull(friend);
            await UserModel.findByIdAndUpdate(user._id, {
                friends: user.friends, 
                sendRequest: user.sendRequest, 
                requests: user.requests
            }, {new: true});
            friend.friends.push(user);
            friend.sendRequest.pull(user);
            friend.requests.pull(user);
            await UserModel.findByIdAndUpdate(friend._id, {
                friends: friend.friends, 
                sendRequest: friend.sendRequest, 
                requests: friend.requests
            }, {new: true});
            return res.status(200).send("Friend added successfully");
        } catch (error) {
            console.log(error)
            if(error instanceof mongoose.CastError) {
                return next(createError.BadRequest('Invalid Id'));
            }
            next(error);
            return;
        }
    },
    displayFriends: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const user = await UserModel.findById(userId).populate('friends');
            if(!user) throw createError.NotFound('user nout found');
            return res.status(200).send(user.friends);
        } catch (error) {
            if(error instanceof mongoose.CastError) {
                return next(createError.BadRequest('Invalid Id'));
            }
            next(error)
            return;
        }
    },
    removeFriend: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const removeFriend = req.body;
            const user = await UserModel.findById(userId);
            if(!user) throw createError.NotFound('user not found');
            const friend = await UserModel.findById(removeFriend._id);
            if(!friend) throw createError.NotFound('friend not found');
            user.friends.pull(friend);
            await UserModel.findByIdAndUpdate(user._id, {friends: user.friends}, {new: true});
            friend.friends.pull(user);
            await UserModel.findByIdAndUpdate(friend._id, {friends: friend.friends}, {new: true})
            return res.status(204).send("Friend removed successfully");
        } catch (error) {
            if(error instanceof mongoose.CastError) {
                return next(createError.BadRequest('Invalid Id'));
            }
            next(error);
            return;
        }
    },
    sendMessages: async(req, res, next) => {
        try {
            
        } catch (error) {
            if(error instanceof mongoose.CastError) {
                return next(createError.BadRequest('Invalid Id'));
            }
            next(error);
            return;
        }
    },
    getMessages: async(req, res, next) => {
        try {
            
        } catch (error) {
            if(error instanceof mongoose.CastError) {
                return next(createError.BadRequest('Invalid Id'));
            }
            next(error);
            return;
        }
    },
    forgotPassword: async(req, res, next) => {
        try {
            const result = req.body;
            const user = await UserModel.findOne({email: result.email});
            if(!user) throw createError.NotFound("User not found");
            let otp = '';
            let letDig = process.env.LET_DIG
            for(let i = 0; i < 6; i++) {
                otp+=letDig[Math.floor(Math.random() * letDig.length)]
            }
            const forgotPassToken = await forgotPasswordToken(user._id, otp);
            return res.status(200).send({forgotPassToken});
        } catch (error) {
            next(error);
            return;
        }
    },
    updatePassword: async(req, res, next) => {
        try {
            const {_id, password} = req.body;
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            const updateUserPassword = await UserModel.findByIdAndUpdate(_id, {password: hashPassword}, {new: true});
            if(!updateUserPassword) throw createError.NotFound("User not found")
            res.status(200).send(updateUserPassword)
            return;
        } catch (error) {
            next(error);
            return;
        }
    },
    logout: async(req, res, next) => {
        try {
            const userId = req.params.id;
            const updatedUser = await UserModel.findByIdAndUpdate(userId, {userStatus: false}, {new: true});
            res.status(204).send("LOGGED OUT");
            return;
        } catch (error) {
            // console.log(error);
            if(error.isJoi === true) error.status = 422;
            next(error);
            return;
        }
    },
}