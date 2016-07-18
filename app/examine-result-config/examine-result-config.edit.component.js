'use strict';

angular.
  module('examineResultConfigEdit').
  component('examineResultConfigEdit', {
    templateUrl: 'examine-result-config/examine-result-config.edit.template.html',
    controller: ['$http', '$scope', 'ngProgressFactory', function examineResultConfigEdit($http, $scope, ngProgressFactory) {
      var self = this;
      $scope.progressbar = ngProgressFactory.createInstance();

      self.configItemShow = function(configItem){
        self.currentConfig = configItem;
      }
      self.clearForm = function(){
        self.currentConfig = null;
      }

      self.queryConfig = function(currentConfig){
        var requestParam = {
          testitemCode: currentConfig.testitemCode,
          testName: currentConfig.testName
        }
        loadConfigList(requestParam);
      }

      self.saveConfig = function(currentConfig){
        $scope.progressbar.start();
        $http.post('http://192.168.0.14:8080/chsp/labs', {
          lisitemCode: currentConfig.lisitemCode,
          testUnit: currentConfig.testUnit,
          testitemCode: currentConfig.testitemCode,
          testName: currentConfig.testName,
          testEngName: currentConfig.testEngName,
          py1: currentConfig.py1,
          seq: currentConfig.seq,
          testMethod: currentConfig.testMethod,
          isTrend: currentConfig.isTrend,
          normalHigh: currentConfig.normalHigh,
          normalLow: currentConfig.normalLow,
          maximumValue: currentConfig.maximumValue,
          minimumValue: currentConfig.minimumValue
        },{
        }).success(function(response){
            console.info("----------response: "+JSON.stringify(response));
            $scope.progressbar.complete();
        }).error(function(response){
          $scope.progressbar.complete();
          console.info("------------response: "+JSON.stringify(response));
        });
      }

      self.deleteConfig = function(currentConfig){
        $http.delete("http://192.168.0.14:8080/chsp/labs?lisitemCode="+currentConfig.lisitemCode+"&testUnit="+currentConfig.testUnit,{
          lisitemCode: currentConfig.lisitemCode,
          testUnit: currentConfig.testUnit
        }).then(function(response){
          console.info("------------response： "+JSON.stringify(response))
        });
      }

      function loadConfigList(options){
        var requestParam = options||{};
        $scope.progressbar.start();
        var config = {
          params: requestParam,
          headers: {
            'Accept' : 'application/json'
          }
        };
        $http.get('http://192.168.0.14:8080/chsp/labs', config).then(function(response){
          $scope.configList = response.data;
          $scope.progressbar.complete();
        },
        function(response){
        });
      }
      function initialize(){
        loadConfigList();
      }
      initialize();
    }
  ]});
