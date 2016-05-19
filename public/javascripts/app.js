var app = angular.module("emailStub", ['ngSanitize']);

app.factory('emailService', function ($http) {
    return {
        login: function (email) {
            return $http.post('mail', {
                email: email
            })
        },
        getOtp: function () {
            return $http.get('mail/otp').then(function (response) {
                return response.data.otp;
            })
        },
        getRegistrationToken: function () {
            return $http.get('mail/registration').then(function (response) {
                return response.data.token;
            });
        },
        getAllEmails: function () {
            return $http.get('mail/').then(function (response) {
                return response.data;
            })
        }
    }
});

app.controller('EmailController', function ($scope, $timeout, $sce, emailService) {
    $scope.from = "MOJ";
    $scope.subject = "Complete your registration";
    $scope.credentials = {};
    $scope.emails = [];

    $scope.login = function (email) {
        emailService.login(email).then(function () {
            $scope.loggedIn = true;

            $timeout(function () {
                $scope.checkEmails();
            }, 2000)
        })
    };

    $scope.checkEmails = function () {
        emailService.getAllEmails().then(function (emails) {
            if (!emails instanceof Array) {
                $scope.emails = []
            } else {
                $scope.emails = emails;
            }
        });
        console.log("Check emails");
    }

    $scope.expandEmail = function (email) {
        $sce.trustAsHtml(email.Body);
        $scope.expandedEmail = email;
    }

    $scope.closeEmail = function () {
        $scope.expandedEmail = null;
    }

});

app.controller('MobileController', function ($scope, $interval, emailService) {
    $interval(function () {
        emailService.getOtp().then(function (otp) {
            $scope.otp = otp;
        });
    }, 1000);
});