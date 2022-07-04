const jwt = require('jsonwebtoken');
const createError = require('http-errors');
const { resolve } = require('path');

module.exports = {
    SignAccessToken: (userId, avatar, userName, userStatus, auth, stat) => {
        return new Promise((resolve, reject) => {
            const payload = {
                audiance: userId,
                avatar: avatar,
                name: userName,
                userStatus: userStatus,
                auth: auth,
                stat: stat,
            }
            const secret = process.env.ACCESS_TOKEN_KEY;
            const options = {
                expiresIn: '1d',
                issuer: 'Aster.com'
            };
            jwt.sign(payload, secret, options, (error, token) => {
                if(error) {
                    console.log(error.message);
                    return reject(createError.InternalServerError);
                }
                return resolve(token);
            })
        });
    },
    VerifyAccessToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if(!authHeader) return next(createError.Unauthorized());

        const bearer = authHeader.split(' ');
        const token = bearer[1];
        const secret = process.env.ACCESS_TOKEN_KEY;

        jwt.verify(token, secret, (error, payload) => {
            if(error) {
                const message = error.name === 'JsonWebTokenError' ? 'Unauthorized' : error.message
                console.log(message);
                next(createError.Unauthorized(messaged));
                return;
            }
            req.payload = payload;
            next();
            return;
        })
    }, //forgot password token
    forgotPasswordToken: (userId, otp) => {
        return new Promise((resolve, reject) => {
            const payload = {
                audiance: userId,
                otp: otp
            }
            console.log(otp)
            const secret = process.env.ACCESS_TOKEN_KEY;
            const options = {
                expiresIn: '5m',
                issuer: 'Aster.com'
            };
            jwt.sign(payload, secret, options, (error, token) => {
                if(error) {
                    console.log(error.message);
                    return reject(createError.InternalServerError);
                }
                return resolve(token);
            })
        });
    }
}