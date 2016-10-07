'use strict';

var http = require('../common/httpClient.js');
var core = require('../common/core.js');
var Q = require('q');

module.exports = function () {
    var getIdamLatestEmail = function (userEmail, subject) {
        return getLatestEmail(core.getConfig().emailMockService.url, userEmail, subject).then(function (response) {
            var newlinesRegex = /\n/g;
            var doubleDots = /\.\./g;

            // Workaround for newline not properly escaped by IDP Email Stub (replacing them with <br /> as will be html)
            // Workaround for issue in ISG Email Stub where dots are sometimes duplicated (due to that registration link gets broken)
            return JSON.parse(
                response.body.replace(doubleDots, '.').replace(newlinesRegex, '<br />')
            )
        })
    };

    var getLatestEmail = function (emailMockBaseUrl, userEmail, subject) {
        var GET_LAST_EMAIL = '/entry-point/getlastemail/';

        return http.sendRequest({
            url: emailMockBaseUrl + GET_LAST_EMAIL + userEmail,
            qs: {
                subject: subject
            },
            method: 'GET'
        });
    }

    this.getUserRegistrationToken = function (userEmail) {
        return getIdamLatestEmail(userEmail, 'Register Your Common Platform Account').then(function (email) {
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
        return getIdamLatestEmail(userEmail, 'OTP notification').then(function (email) {
            var otpCodeRegex = /Your Common Platform one-time passcode is \W*(.*)/
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
        return getIdamLatestEmail(userEmail, 'Reset Your Common Platform Account');
    };

    this.getUserRegistrationMail = function (userEmail) {
        return getIdamLatestEmail(userEmail, 'Register Your Common Platform Account');
    };

    this.getReregisterMail = function (userEmail) {
        return getIdamLatestEmail(userEmail, 'Re-registration of your Common Platform Account');
    };

    this.getNewCommonPlatformAdministratorCreatedMail = function (userEmail) {
        return getIdamLatestEmail(userEmail, 'New Common Platform Administrator Created');
    };

    this.getNewCommonPlatformSupportAdministratorCreatedMail = function (userEmail) {
        return getIdamLatestEmail(userEmail, 'New Common Platform Support Administrator Created');
    };

    this.getInformListUpdatedMail = function (userEmail) {
        return getIdamLatestEmail(userEmail, 'Your Common Platform Organisation Notification List has changed');
    };

    this.getAllEmails = function (userEmail) {
        return Q.all([
            this.getResetPasswordMail(userEmail),
            this.getReregisterMail(userEmail),
            this.getUserRegistrationMail(userEmail),
            this.getNewCommonPlatformAdministratorCreatedMail(userEmail),
            this.getNewCommonPlatformSupportAdministratorCreatedMail(userEmail),
            this.getInformListUpdatedMail(userEmail),
            getIdamLatestEmail(userEmail, 'New Common Platform User Created'),
            getIdamLatestEmail(userEmail, 'Organisation re-registered on Common Platform'),
            getIdamLatestEmail(userEmail, 'Organisation deregistered on Common Platform'),
            getIdamLatestEmail(userEmail, 'Common Platform User Deleted'),
            getIdamLatestEmail(userEmail, 'Account deregistered on Common Platform'),
            getIdamLatestEmail(userEmail, 'Change of name on your Common Platform account')
        ]).then(function (emails) {
            console.log(emails)
            return emails.filter(function (email) {
                return email.Body !== undefined;
            })
        })
    };

};
