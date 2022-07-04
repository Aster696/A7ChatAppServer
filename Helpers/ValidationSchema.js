const joi = require('@hapi/joi');

const registerValidation = joi.object({
    userName: joi.string().required(),
    email: joi.string().email().required(),
    contact: joi.string().required(),
    password: joi.string().required(),
    avatar: joi.any(),
    aboutme: joi.string(),
    description: joi.string(),
    gallery: joi.any(),
    userStatus: joi.boolean(),
    authority: joi.string(),
    status: joi.string(),
    reports: joi.array(),
    friends: joi.array(),
    messages: joi.array(),
    requests: joi.array(),
});

const loginValidation = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
    gallery: joi.any(),
    avatar: joi.any(),
    aboutme: joi.string(),
    description: joi.string(),
    gallery: joi.any(),
    userStatus: joi.boolean(),
    authority: joi.string(),
    status: joi.string(),
    reports: joi.array(),
    friends: joi.array(),
    messages: joi.array(),
    requests: joi.array(),
});

module.exports = {
    registerValidation,
    loginValidation,
}
