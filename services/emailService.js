'use strict';

var http = require('../common/http.js');
var core = require('../common/core.js');
var Q = require('q');

module.exports = function () {
    var getIdpLatestEmail = function (userEmail, subject) {
        return getLatestEmail(core.getConfig().idpEmailMockService.url, userEmail, subject).then(function (response) {
            // Workaround for issue in ISG Email Stub where dots are sometimes duplicated (due to that registration link gets broken)
            // Bus to provide more details
            return JSON.parse(response.body.replace(/\.\./g, '.'));
        });
    };

    var getIdamLatestEmail = function (userEmail, subject) {
        return getLatestEmail(core.getConfig().idamEmailMockService.url, userEmail, subject).then(function (response) {
            var newlinesRegex = /\n/g

            // Workaround for newline not properly escaped by IDP Email Stub
            // Since the message is going to be displayed as HTML we're replacing them with <br />
            return JSON.parse(
                response.body.replace(newlinesRegex, "<br />")
            )
        })
    };

    var getLatestEmail = function (emailMockBaseUrl, userEmail, subject) {
        var GET_LAST_EMAIL = '/entry-point/getlastemail/';

        return http.getHttpClient().sendRequest({
            url: emailMockBaseUrl + GET_LAST_EMAIL + userEmail,
            qs: {
                subject: subject
            },
            method: 'GET'
        });
    }

    this.getUserRegistrationToken = function (userEmail) {
        return getIdpLatestEmail(userEmail, 'Register Your Common Platform Account').then(function (email) {
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
        return getIdpLatestEmail(userEmail, 'OTP notification').then(function (email) {
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
        return getIdpLatestEmail(userEmail, 'Reset Your Common Platform Account');
    };

    this.getUserRegistrationMail = function (userEmail) {
        return getIdpLatestEmail(userEmail, 'Register Your Common Platform Account');
    };

    this.getReregisterMail = function (userEmail) {
        return getIdpLatestEmail(userEmail, 'Re-registration of your Common Platform Account');
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
            this.getInformListUpdatedMail(userEmail)
        ]).then(function (emails) {
            console.log(emails)
            return emails.filter(function (email) {
                return email.Body !== undefined;
            })
        })
    };

};
