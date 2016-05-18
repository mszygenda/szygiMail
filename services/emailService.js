'use strict';

var http = require('../common/http.js');
var core = require('../common/core.js');

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
};