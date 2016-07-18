'use strict';
var mainModule = angular.module('caseHistory');

mainModule.config(['$locationProvider', '$routeProvider',
  function config($locationProvider, $routeProvider){
    $locationProvider.hashPrefix('!');

    $routeProvider.
      when('/sessions/new', {
        template: '<sessions-new-component></sessions-new-component>'
      }).
      when('/patients/index', {
        template: '<patients-index></patients-index>'
      }).
      when('/phone-list', {
        template: '<phone-list></phone-list>'
      }).
      when('/examine-result-config', {
        template: '<examine-result-config-edit></examine-result-config-edit>'
      }).
      when('/examine-target-config', {
        template: '<examine-target-config-edit></examine-target-config-edit>'
      }).
      when('/patients/show', {
        template: '<patients-show></patients-show>'
      }).
      when('/sign-examine-partial-config', {
        template: '<sign-examine-partial-config-edit></sign-examine-partial-config-edit>'
      }).
      when('/sign-display-config', {
        template: '<sign-display-config-edit></sign-display-config-edit>'
      });
    }
  ]);

mainModule.run(function($rootScope, AUTH_EVENTS, AuthService) {
  $rootScope.$on('$stateChangeStart', function (event, next) {
    var authorizedRoles = next.data.authorizedRoles;
    if (!AuthService.isAuthorized(authorizedRoles)) {
      event.preventDefault();
      if (AuthService.isAuthenticated()) {
        // user is not allowed
        $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
      } else {
        // user is not logged in
        $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
      }
    }
  });
});
