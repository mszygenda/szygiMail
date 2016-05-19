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
            var tokenRegex = /.*need to go to .*\/(.*) or by.*/
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
            var resetPasswordLink = "https://poa.am.shr.cpp.gov.uk/users.html#/create-new-password/" + token;

            email.Body = email.Body.replace(/http:\/\/www.resetpassword\.co\.uk\/\S*|http:\/\/www\.resetpassword\.com/g, resetPasswordLink);

            return email;
        });
    };

    this.getUserRegistrationMail = function (userEmail) {
        return getLatestEmail(userEmail, 'Register Your Common Platform Account').then(function (email) {
            if (!email.Body) {
                return email;
            }

            var token = extractToken(email.Body)
            return {
                To: email.To,
                From: email.From,
                Subject: email.Subject,
                Body: "Dear Mr Mateusz Szygenda <BR><BR>An account has been created for you on the Criminal Justice Common Platform service, however, you need to finish the final set-up steps by creating a password. Your username has already been assigned to you, and this is the email address your Administrator provided during the initial registration process.<BR><BR>It should take no longer than five minutes to finish setting up your account and once done you will be able to sign in and use the Common Platform services that have been assigned to you.<BR><BR>To complete registration of your account, you need to go to https://poa.am.shr.cpp.gov.uk/users.html#/register/" + token + " or by <a href='https://poa.am.shr.cpp.gov.uk/users.html#/register/" + token + "' >clicking on this link</a><BR><BR>If you require any assistance during the process, please contact our administrator or the Business Support Team. <BR>Please do not reply to this email as it has been sent from an unmanned email address. <BR><BR><BR>The Common Platform Business Support Team <BR>Help Desk Number: 020 3334 2999 <BR>Email: CrimeITSupport@hmcts.gsi.gov..uk<BR>"
            }
        })
    };

    this.getReregisterMail = function (userEmail) {
        return getLatestEmail(userEmail, 'Re-registration of your Common Platform Account').then(function (email) {
            if (!email.Body) {
                return email;
            }
            var token = extractToken(email.Body);
            var registerLink = "https://poa.am.shr.cpp.gov.uk/users.html#/register/" + token;

            email.Body = email.Body.replace(/http:\/\/www.resetpassword\.co\.uk\/\S*|http:\/\/www\.resetpassword\.com/g, registerLink);

            return email;
        });
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