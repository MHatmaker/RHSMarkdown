'use strict';

//var docCon = '';

var DocListAppNG = angular.module("DocListAppNG", ['ngRoute', 'ui.bootstrap'])
    .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    //alert('DocListAppNG module route provider');
    $routeProvider.
      when('/', {
        // templateUrl: 'index',
        templateUrl: '/partials/index',
        controller: DocsCtrl, reloadOnSearch: true
      }).
      when('/showDoc/:id', {
        templateUrl: 'partials/readDoc',
        controller: DocShowCtrl
      }).
      otherwise({
          redirectTo: '/'
      });
    $locationProvider.html5Mode(true);
   }
]);

DocListAppNG.docCon = '';


DocListAppNG.controller('DocsListController',
    function DocsListController($scope, $http, $sce) {
        //alert('DocsListController');
    
        //$scope.snip = DocListAppNG.docCon;
        $scope.renderHtml = function () {
            $scope.snip = DocListAppNG.docCon;
            return $sce.trustAsHtml($scope.snip);
        };
    });
 
//DocListAppNG.controller('CollapseCtrl',  ['$scope', function($scope) {


function DocsCtrl($scope, $http) {
    $scope.isCollapsed = false;
    console.log("init with isCollapsed = " + $scope.isCollapsed);
    
    console.log("DocsCtrl buildList");
    $http.get('/api/docsList').
    success(function(data, status, headers, config) {
        $scope.docs = data.doclist;
        console.log(data.doclist);
    });
    
    $scope.collapser = function(){
        console.log("collapser before " + $scope.isCollapsed);
        $scope.isCollapsed = !$scope.isCollapsed;
        console.log("collapser after  " + $scope.isCollapsed);
    }
}

function DocShowCtrl($scope, $http, $routeParams, $rootScope){
    var mdName = $routeParams.id;
    $http.get('/api/MarkdownSimple/' + mdName)
        .then(function(results){
            //Success;
            console.log("Success: " + results.status);
            $scope.docId = $routeParams.id;
            DocListAppNG.docCon = results.data.DocContents;
            $scope.doc = results.data;
            console.log($scope.doc.Doc);
        }, function(results){
            //error
            console.log("Error: " + results.data + "; "
                                  + results.status);
        })
    
};
