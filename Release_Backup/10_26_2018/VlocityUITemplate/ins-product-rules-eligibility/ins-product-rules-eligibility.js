vlocity.cardframework.registerModule.controller('vlocInsRulesEligibilityCtrl', ['$scope', '$rootScope', '$window', 'vlocInsProductRulesService', function($scope, $rootScope, $window, vlocInsProductRulesService) {
    'use strict';
    $scope.eligibility = {
        rule: '',
        saveStatus: 'unsaved'
    };

    $scope.initEligibility = function(obj) {
        console.log('initEligibility', obj);
        $scope.eligibility.rule = obj.eligibilityRule;
        $scope.eligibility.saveStatus = 'saved';
    };

    $scope.saveEligibilityRule = function() {
        var inputMap = {
            productId: $scope.params.id,
            eligibilityRule: $scope.eligibility.rule
        };
        $scope.eligibility.saveStatus = 'unsaved';
        vlocInsProductRulesService.performApexRemoteAction($scope, 'InsuranceProductAdminHandler', 'saveEligibilityRule', inputMap).then(function(result) {
            console.log('success in saveEligibilityRule', result, $scope.eligibility);
            $scope.eligibility.saveStatus = 'saved';
        }, function(error) {
            $scope.eligibility.saveStatus = 'error';
            console.log('error in saveEligibilityRule', error, $scope.eligibility);
        });
    };

    $scope.markExpressionUnsaved = function() {
        $scope.eligibility.saveStatus = 'unsaved';
    };
}]);