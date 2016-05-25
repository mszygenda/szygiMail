'use strict';

var http = require('../common/http.js');
var core = require('../common/core.js');
var Q = require('q');

module.exports = function () {
    var getLatestEmail = function (userEmail, subject) {
        var GET_LAST_EMAIL = '/entry-point/getlastemail/';

        return http.getHttpClient().sendRequest({
            url: core.getConfig().idpEmailMockService.url + GET_LAST_EMAIL + userEmail,
            qs: {
                subject: subject
            },
            method: 'GET'
        }).then(function (response) {
            return JSON.parse(response.body)
        });
    };

    this.getUserRegistrationToken = function (userEmail) {
        return getLatestEmail(userEmail, 'Register Your Common Platform Account').then(function (email) {
            var tokenRegex = /.*#\/register\/(.*)'/
            var tokenMatches = tokenRegex.exec(email.Body);

            if (tokenMatches) {
                return tokenMatches[1];
            } else {
                throw new Error("Could not retrieve registration token for user:", userEmail);
            }
        });
    };

    this.getOtpCode = function (userEmail) {
        return getLatestEmail(userEmail, 'OTP notification').then(function (email) {
            var otpCodeRegex = /Your OTP is: \W*(.*)/
            var otpMatches = otpCodeRegex.exec(email.Body);

            if (otpMatches) {
                return otpMatches[1];
            } else {
                throw new Error("Could not retrieve OTP code for user:", userEmail);
            }
        });
    }

    var extractToken = function (emailBody) {
        var tokenRegex = /.*to http.*\/(.*) or by.*/
        var tokenMatches = tokenRegex.exec(emailBody);

        if (tokenMatches) {
            return tokenMatches[1];
        } else {
            throw new Error("Could not retrieve registration token from email" + emailBody);
        }
    };

    this.getResetPasswordMail = function (userEmail) {
        return getLatestEmail(userEmail, 'Reset Your Common Platform Account').then(function (email) {
            if (!email.Body) {
                return email;
            }
            var token = extractToken(email.Body);
            var resetPasswordLink = "https://poa.am.shr.cpp.gov.uk/users.html#/create-new-password";

            email.Body = email.Body.replace(/https:\/\/poa.am.shr.cpp.gov.uk\/users.html#\/register/g, resetPasswordLink);

            return email;
        });
    };

    this.getUserRegistrationMail = function (userEmail) {
        return getLatestEmail(userEmail, 'Register Your Common Platform Account');
    };

    this.getReregisterMail = function (userEmail) {
        return getLatestEmail(userEmail, 'Re-registration of your Common Platform Account');
    };

    this.getAllEmails = function (userEmail) {
        return Q.all([
            this.getResetPasswordMail(userEmail),
            this.getReregisterMail(userEmail),
            this.getUserRegistrationMail(userEmail)
        ]).then(function (emails) {
            console.log(emails)
            return emails.filter(function (email) {
                return email.Body !== undefined;
            })
        })
    };

};