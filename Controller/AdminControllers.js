const createError = require('http-errors');
const UserModel = require('../Models/UserModel');
const mongoose = require('mongoose');

module.exports = {
    deleteUser: async(req, res, next) => {
        try {
            const id = await req.params.id;
            const deleteUser = await UserModel.findByIdAndDelete(id);
            if(!deleteUser) throw createError.NotFound('User not found');
            res.status(204).send('user deleted successfully');
            return;
        } catch (error) {
            if(error instanceof mongoose.CastError){
                return next(createError.BadRequest('Invalid id'));
            }
            next(error);
            return;
        }
    },
}