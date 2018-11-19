vlocity.cardframework.registerModule.controller('vlocInsRulesRequirementsCtrl', ['$scope', '$rootScope', '$window', '$timeout', 'vlocInsProductRulesService', function($scope, $rootScope, $window, $timeout, vlocInsProductRulesService) {
    'use strict';
    $scope.productRequirements = [];
    $scope.applicableTypeOptions = [{
        label: 'Asset',
        value: 'Asset'
    }, {
        label: 'Contract',
        value: 'Contract'
    }, {
        label: 'Quote',
        value: 'Quote'
    }];

    $scope.initRequirements = function(obj) {
        $scope.productRequirements = obj.productRequirements;
        console.log('$scope.productRequirements', $scope.productRequirements);
        angular.forEach($scope.productRequirements, function(req, i) {
            req.nameUnique = true;
            req.saveStatus = 'saved';
            if (req.state && req.stateOptions) {
                angular.forEach(req.stateOptions, function(stateOption) {
                    if (stateOption.stateName === req.state) {
                        req.state = stateOption;
                    }
                });
            }
        });
        if (!$scope.productRequirements.length) {
            $scope.addRequirement();
        }
        // Hide VF page spinner:
        angular.element('.vloc-ins-product-model-initial-spinner').hide();
    };

    $scope.getObjectStates = function(requirement) {
        var inputMap = {};
        if (requirement.objectType && requirement.name) {
            requirement.saveStatus = 'unsaved';
            inputMap.objectType = requirement.objectType;
            vlocInsProductRulesService.performApexRemoteAction($scope, 'InsuranceProductAdminHandler', 'getObjectStates', inputMap).then(function(result) {
                requirement.stateOptions = result.states;
                requirement.checkedStates = false;
                console.log('requirement.stateOptions', requirement.stateOptions);
                $scope.saveProductRequirement(requirement);
            }, function(error) {
                requirement.saveStatus = 'error';
                console.log('error in vlocInsProductRulesService.getObjectStates', error);
            });
        } else {
            console.log('$scope.getObjectStates: no requirement.objectType', requirement);
        }
    };

    $scope.getStateActions = function(requirement) {
        var inputMap = {};
        if (requirement.state && requirement.name) {
            requirement.saveStatus = 'unsaved';
            inputMap.stateId = requirement.state.stateId;
            vlocInsProductRulesService.performApexRemoteAction($scope, 'InsuranceProductAdminHandler', 'getStateActions', inputMap).then(function(result) {
                requirement.actionOptions = result.stateActions;
                console.log('requirement.actionOptions', requirement.actionOptions);
                $scope.saveProductRequirement(requirement);
            }, function(error) {
                requirement.saveStatus = 'error';
                console.log('error in getStateActions', error);
            });
        } else {
            console.log('$scope.getStateActions: no requirement.state', requirement);
        }
    };

    $scope.saveProductRequirement = function(requirement) {
        var inputMap = {};
        if (requirement.name && requirement.objectType && requirement.state.stateId && requirement.actionId && !$rootScope.saveProcessing) {
            requirement.saveStatus = 'unsaved';
            inputMap.productRequirement = requirement;
            console.log('productRequirement sent to service:', inputMap);
            $rootScope.saveProcessing = true;
            vlocInsProductRulesService.performApexRemoteAction($scope, 'InsuranceProductAdminHandler', 'saveProductRequirement', inputMap).then(function(result) {
                console.log('success in saveProductRequirement', result);
                requirement.Id = result.Id;
                requirement.saveStatus = 'saved';
                $rootScope.saveProcessing = false;
            }, function(error) {
                console.log('error in saveProductRequirement', error);
                requirement.saveStatus = 'error';
            });
        } else if ($rootScope.saveProcessing) {
            $timeout(function() {
                $scope.saveProductRequirement(requirement);
            }, 500);
        } else {
            console.log('cannot save because a required input is missing', requirement);
        }
    };

    $scope.isNameUnique = function(requirement, index) {
        var nameNotUnique = false;
        if (requirement.name) {
            angular.forEach($scope.productRequirements, function(req, i) {
                if (!nameNotUnique && req.name === requirement.name && i !== index) {
                    nameNotUnique = true;
                }
            });
        }
        if (requirement.Id) {
            $scope.saveProductRequirement(requirement);
        }
        requirement.nameUnique = !nameNotUnique;
    };

    $scope.checkStates = function(requirement) {
        if (!requirement.checkedStates && requirement.objectType && requirement.name) {
            $timeout(function() {
                if (!requirement.stateOptions.length) {
                    return false;
                }
                return true;
            }, 250);
            requirement.checkedStates = true;
        }
        return true;
    };

    $scope.addRequirement = function() {
        var newRequirement = {
            name: '',
            objectType: '',
            state: {},
            condition: '',
            message: '',
            isActive: false,
            nameUnique: true,
            productId: $scope.params.id,
            stateOptions: [],
            saveStatus: 'unsaved'
        };
        if ($scope.productRequirements.length) {
            newRequirement.newRequirement = true;
        }
        $scope.productRequirements.push(newRequirement);
        if ($scope.productRequirements.length > 1) {
            $timeout(function() {
                delete $scope.productRequirements[$scope.productRequirements.length - 1].newRequirement;
            }, 200);
        }
    };

    $scope.deleteRequirement = function(requirement, index) {
        var inputMap = {};
        requirement.inDelete = !requirement.inDelete;
        if (requirement.Id && requirement.Id !== null) {
            inputMap.Id = requirement.Id;
            vlocInsProductRulesService.performApexRemoteAction($scope, 'InsuranceProductAdminHandler', 'deleteProductRequirement', inputMap).then(function(result) {
                console.log('success in deleteProductRequirement', result);
            }, function(error) {
                console.log('error in deleteProductRequirement', error);
            });
        }
        $timeout(function() {
            requirement.isDeleted = true;
        }, 250);
        $timeout(function() {
            requirement.isDeleted = false;
            $scope.productRequirements.splice(index, 1);
            console.log($scope.productRequirements);
        }, 900);
    };

    $scope.deletePrompt = function(requirement) {
        if (!requirement.inDelete) {
            angular.forEach($scope.productRequirements, function(req) {
                req.inDelete = false;
            });
        }
        requirement.inDelete = !requirement.inDelete;
    };

    $scope.markExpressionUnsaved = function(requirement) {
        requirement.saveStatus = 'unsaved';
    };
}]);