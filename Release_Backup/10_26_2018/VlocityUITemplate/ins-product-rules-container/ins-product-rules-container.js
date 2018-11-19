vlocity.cardframework.registerModule.controller('vlocInsRulesContainerCtrl', ['$scope', '$rootScope', '$window', 'vlocInsProductRulesService', function($scope, $rootScope, $window, vlocInsProductRulesService) {
    'use strict';
    var inputMap = {};
    inputMap.productId = $scope.params.id;
    vlocInsProductRulesService.performApexRemoteAction($scope, 'InsuranceProductAdminHandler', 'getTypeAheadAttributes', inputMap).then(function(result) {
        console.log('success in getTypeAheadAttributes', result);
        if (result.typeAheadMaps) {
            vlocInsProductRulesService.formatTypeAheadArray(result.typeAheadMaps).then(function(result2) {
                var functionKind = 2;
                if ($window.monaco && $window.monaco.languages && $window.monaco.languages.CompletionItemKind.Function) {
                    functionKind = $window.monaco.languages.CompletionItemKind.Function;
                }
                var additionalFunctions = [{
                    label: 'EXIST',
                    kind: functionKind,
                    insertText: {
                        value: 'EXIST(${1:attribute}, ${2:value})'
                    }
                }, {
                    label: 'NOTEXIST',
                    kind: functionKind,
                    insertText: {
                        value: 'NOTEXIST(${1:attribute}, ${2:value})'
                    }
                }, {
                    label: 'LookupMatrix',
                    kind: functionKind,
                    insertText: {
                        value: 'LookupMatrix(\'${1:matrixName}\', INPUT(\'${2:inputVariable1}\', ${3:attribute}), INPUT(\'${4:inputVariable2}\', ${5:attribute}), \'${6:outputVariable}\')'
                    }
                }];
                if (!$window.additionalCompletionItems || $window.additionalCompletionItems !== Object) {
                    $window.additionalCompletionItems = {
                        Keyword: [],
                        Function: []
                    };
                }
                $window.additionalCompletionItems.Keyword = result2;
                $window.additionalCompletionItems.Function = $window.additionalCompletionItems.Function.concat(additionalFunctions);
                $rootScope.attributeNames = $window.additionalCompletionItems;
                console.log('$rootScope.attributeNames formatted', $rootScope.attributeNames);
            }, function(error) {
                console.log('There has been an error in formatTypeAheadArray', error);
            });
        }
    }, function(error) {
        console.log('There has been an error in formatTypeAheadArray', error);
    });
}]);
vlocity.cardframework.registerModule.factory('vlocInsProductRulesService', ['$rootScope', '$window', '$q', 'dataSourceService', function($rootScope, $window, $q, dataSourceService) {
    'use strict';
    return {
        performApexRemoteAction: function(scope, remoteClass, remoteMethod, inputParams, optionParams) {
            var deferred = $q.defer();
            var datasource = {};
            datasource.type = 'ApexRemote';
            datasource.value = {
                remoteNSPrefix: $rootScope.nsPrefix,
                remoteClass: remoteClass,
                remoteMethod: remoteMethod
            };
            if (inputParams && inputParams.constructor === Object) {
                datasource.value.inputMap = inputParams;
            }
            if (optionParams && optionParams.constructor === Object) {
                datasource.value.optionsMap = optionParams;
            }
            dataSourceService.getData(datasource, scope, null).then(
                function(data) {
                    deferred.resolve(data);
                },
                function(error) {
                    console.error(error);
                    deferred.reject(error);
                });
            return deferred.promise;
        },
        formatTypeAheadArray: function(typeAheadArray) {
            var deferred = $q.defer();
            var formattedArray = [];
            var keywordKind = 13;
            if ($window.monaco && $window.monaco.languages && $window.monaco.languages.CompletionItemKind.Keyword) {
                keywordKind = $window.monaco.languages.CompletionItemKind.Keyword;
            }
            if (!typeAheadArray) {
                deferred.reject('No data passed into function.');
            } else {
                angular.forEach(typeAheadArray, function(product) {
                    if (product.attributeList) {
                        angular.forEach(product.attributeList, function(attribute) {
                            formattedArray.push({
                                label: product.productCode + '.' + attribute.attributeCode,
                                kind: keywordKind,
                                insertText: {
                                    value: product.productCode + '.' + attribute.attributeCode
                                }
                            });
                        });
                    }
                });
            }
            deferred.resolve(formattedArray);
            return deferred.promise;
        }
    };
}]);
vlocity.cardframework.registerModule.directive('contenteditable', ['$sce', function($sce) {
    'use strict';
    return {
        restrict: 'A', // only activate on element attribute
        require: '?ngModel', // get a hold of NgModelController
        link: function(scope, element, attrs, ngModel) {
            if (!ngModel) return; // do nothing if no ng-model

            // Specify how UI should be updated
            ngModel.$render = function() {
                element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));
                read(); // initialize
            };

            // Listen for change events to enable binding
            element.on('blur keyup change', function() {
                scope.$evalAsync(read);
            });

            // Write data to the model
            function read() {
                var html = element.html();
                // When we clear the content editable the browser leaves a <br> behind
                // If strip-br attribute is provided then we strip this out
                if (attrs.stripBr && html === '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
}]);