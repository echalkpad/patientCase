'use strict';

angular.
  module('sessionsNewComponent').
  component('sessionsNewComponent', {
    templateUrl: 'sessions/sessions.new.template.html',
    controller: ['$http', '$scope', '$rootScope', 'AUTH_EVENTS', 'AuthService', '$location', function sessionsNewComponent($http, $scope, $rootScope, AUTH_EVENTS, AuthService, $location) {
      var self = this;

      self.credentials = {
        userId: '',
        userPassword: ''
      };

      self.login = function(credentials){
        AuthService.login(credentials).then(function (user) {
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
          //$scope.setCurrentUser(user);
          $location.path("/patients/index");
        }, function () {
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        });
      }

      self.testLogin = function(){
       $location.path("/patients/index");
        return;
        $http.post('http://192.168.0.14:8080/chsp/login', {
          userId: self.userName,
          userPassword: self.password
        },{

        }).success(function(){
            console.info("----------123");
            //window.location.href = "Gulugulus/subMenu";
        });
      }
    }
  ]});
