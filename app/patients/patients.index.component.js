'use strict';

angular.
  module('patientsIndex').
  component('patientsIndex', {
    templateUrl: 'patients/patients.index.template.html',
    controller: ['$http', '$scope', function patientsIndex($http, $scope) {
      var self = this;

      self.reset = function(){
        self.idNo = "";
        self.mrNo = "";
        self.patName = "";
        self.year = "";
        self.month = "";
        self.day = "";
      }

      self.query = function(){
        loadPatients({
          idNo: self.idNo,
          mrNo: self.mrNo,
          patName: self.patName,
          year: self.year,
          month: self.month,
          day: self.day,
          sAge: self.minAge,
          eAge: self.maxAge,
          sexType: self.sexType
        });
      }

      function loadPatients(data){
        var config = {
         params: data,
         headers : {
          'Accept' : 'application/json'
          }
        };

        $http.get('http://192.168.0.14:8080/chsp/patients', config).then(function(response) {
          $scope.patients = response.data;
          },
          function(response) {
        });
      }

      function initialize(){
        loadPatients();
      }
      initialize();
    }
  ]});
