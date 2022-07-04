const nodemailer = require('nodemailer');
const express = require('express');
const router = express.Router();
const createError = require('http-errors');

router.post('/send-gmail', async (req, res, next) => {

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.G_USER,
                pass: process.env.G_PASS
            }
        });
    
        const result = req.body;
    
        const mailOptions = {
            from: process.env.G_USER,
            to: result.to,
            subject: result.subject,
            text: result.text
        };
    
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log({error, mailOptions});
                res.send(createError.NotAcceptable('email data is not given'));
            } else {
                console.log('Email sent: ' + info.response);
                res.send({mailOptions});
            }
        });
    } catch (error) {
        console.log(error.message);
        next(error);
    }
});

module.exports = router