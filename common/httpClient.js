'use strict';

var request = require('request');
var extend = require('extend');
var Q = require('q');
var core = require('./core.js')

var config = core.getConfig();

module.exports = {
    sendRequest: function (options) {
        var requestDeferred = Q.defer();
        console.log("Sending request", options)
        request(
            extend({
                rejectUnauthorized: false,
                proxy: config.httpClient.proxy,
                method: 'GET',
                followRedirect: false
            }, options),
            function (err, response, body) {
                if (err) {
                    console.log("Http Request failed" + err)
                    return;
                    //throw new Error("Http Request failed" + err);
                }

                if (response.statusCode < 400) {
                    requestDeferred.resolve(response);
                } else {
                    console.log("Request failed:", options.method, options.url);
                    console.log("Status:", response.statusCode);
                    console.log("Request body:", options.body);
                    console.log("Response body", response.body);
                    requestDeferred.reject(response);
                }
            }
        );

        return requestDeferred.promise;
    }
};
