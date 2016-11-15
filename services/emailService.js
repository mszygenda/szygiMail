'use strict';

var http = require('../common/httpClient.js');
var core = require('../common/core.js');
var Q = require('q');

module.exports = function () {

    var idam_orgadmin_created='New user added on Common Platform';
    var idam_orgadmin_rereg='User re-registered on Common Platform';
    var idam_org_dereg='Organisation deregistered on Common Platform';
    var idam_org_updated='Organisation details have changed on Common Platform';
    var idam_org_informlist_updated='Email notification list updated on Common Platform';
    var idam_org_rereg='Organisation re-registered on Common Platform';
    var idam_cppadmin_created='New user added on Common Platform';
    var idam_cppadmin_rereg='User re-registered on Common Platform';
    var idam_user_created='New user added on Common Platform';
    var idam_user_dereg='User deregistered on Common Platform';
    var idam_user_dereg_for_user='Account deregistered on Common Platform';
    var idam_user_name_updated='Change of name on your Common Platform account';
    var idam_user_rereg='User re-registered on Common Platform';
    var idam_user_role_changed='User changed to an Administrator on Common Platform';

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

    this.getInformListUpdatedMail = function (userEmail) {
        return getIdamLatestEmail(userEmail, idam_org_informlist_updated);
    };

    this.getNewCommonPlatformAdministratorCreatedMail = function (userEmail) {
        return getIdamLatestEmail(userEmail, idam_cppadmin_created);
    };

    this.getNewCommonPlatformSupportAdministratorCreatedMail = function (userEmail) {
        return getIdamLatestEmail(userEmail, idam_orgadmin_created);
    };

    console.log('Following email subjects  do not differ any more: ' +
                 idam_orgadmin_created + idam_cppadmin_created +
                 idam_orgadmin_rereg   + idam_cppadmin_rereg);

    this.getAllEmails = function (userEmail) {
        return Q.all([
            this.getResetPasswordMail(userEmail),
            this.getReregisterMail(userEmail),
            this.getUserRegistrationMail(userEmail),
            this.getInformListUpdatedMail(userEmail),
            getIdamLatestEmail(userEmail, idam_org_dereg),
            getIdamLatestEmail(userEmail, idam_org_updated),
            getIdamLatestEmail(userEmail, idam_org_informlist_updated),
            getIdamLatestEmail(userEmail, idam_org_rereg),
            getIdamLatestEmail(userEmail, idam_user_created),
            getIdamLatestEmail(userEmail, idam_user_dereg),
            getIdamLatestEmail(userEmail, idam_user_dereg_for_user),
            getIdamLatestEmail(userEmail, idam_user_name_updated),
            getIdamLatestEmail(userEmail, idam_user_rereg),
            getIdamLatestEmail(userEmail, idam_user_role_changed)
        ]).then(function (emails) {
            console.log(emails)
            return emails.filter(function (email) {
                return email.Body !== undefined;
            })
        })
    };

};
