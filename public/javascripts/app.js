var app = angular.module("emailStub", []);

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
        }
    }
});

app.controller('EmailController', function ($scope, $timeout, emailService) {
    $scope.from = "MOJ";
    $scope.subject = "Complete your registration";
    $scope.credentials = {};
    $scope.login = function (email) {
        emailService.login(email).then(function () {
            $scope.loggedIn = true;

            $timeout(function () {
                $scope.checkEmails();
            }, 2000)
        })
    };

    $scope.checkEmails = function () {
        console.log("Check emails");
        emailService.getRegistrationToken().then(function (token) {
            $scope.token = token;
        })
    }

    $scope.expandEmail = function () {
        $scope.emailExpanded = true;
    }

});

app.controller('MobileController', function ($scope, $interval, emailService) {
    $interval(function () {
        emailService.getOtp().then(function (otp) {
            $scope.otp = otp;
        });
    }, 1000);
});