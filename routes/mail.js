var express = require('express');
var EmailService = require('../services/emailService.js');
var emailService = new EmailService();
var router = express.Router();
var email = null;

router.post('/', function (req, res) {
    email = req.body.email;
    req.session.email = req.body.email;

    res.send({
        message: "email registered"
    });
});

router.get('/', function (req, res) {
    return emailService.getAllEmails(email).then(function (emails) {
        res.send(emails);
    }, function (e) {
        res.send({
            message: "Failed to retrieve emails" + e
        })
    })
});

/* GET users listing. */
router.get('/otp', function(req, res, next) {
    //var email = req.session.email;

    emailService.getOtpCode(email).then(function (otpCode) {
        res.send({
            otp: otpCode
        });
    }, function () {
        res.send({
            message: "Failed to retrieve OTP"
        });
    })
});

router.get('/registration', function(req, res, next) {
    //var email = req.session.email;

    emailService.getUserRegistrationToken(email).then(function (registrationToken) {
        res.send({
            token: registrationToken
        });
    }, function () {
        res.send({
            message: "Failed to retrieve Registration Token"
        });
    })
});



module.exports = router;
