vlocity.cardframework.registerModule.controller('insOsProductDetailsCompareModalCtrl', ['$scope', '$rootScope', function($scope, $rootScope) {
    'use strict';
    baseCtrl.prototype.$scope.insEnrollmentFlow = false;
    if (baseCtrl.prototype.$scope.bpTree.children[baseCtrl.prototype.$scope.insPsControlRef
        [baseCtrl.prototype.$scope.currentElementName].rootIndex - 1].propSetMap.remoteClass === 'EnrollmentHandler') {
        baseCtrl.prototype.$scope.insEnrollmentFlow = true;
    }

    // $scope variables
    $scope.currencyCode = '$';
    if (baseCtrl.prototype.$scope.bpTree.propSetMap.currencyCode) {
        $scope.currencyCode = baseCtrl.prototype.$scope.bpTree.propSetMap.currencyCode;
    } else if (baseCtrl.prototype.$scope.bpTree.oSCurrencySymbol) {
        $scope.currencyCode = baseCtrl.prototype.$scope.bpTree.oSCurrencySymbol;
    }

    // Local functions
    function formatContent(products) {
        var formattedContent = {
            topRow: [],
            attributeRows: [],
            attributeIndices: {}
        };
        angular.forEach(products, function(product, productIterator) {
            formattedContent.topRow.push({
                ProductCode: product.ProductCode,
                Name: product.Name,
                Id: product.Id,
                Price: product.Price,
                disabledByRateBand: product.disabledByRateBand
            });
            if (product.attributeCategories && product.attributeCategories.records) {
                angular.forEach(product.attributeCategories.records, function(attributeCategory) {
                    if (attributeCategory.productAttributes && attributeCategory.productAttributes.records) {
                        angular.forEach(attributeCategory.productAttributes.records, function(productAttribute) {
                            var attributeRowsLength;
                            if (formattedContent.attributeIndices.hasOwnProperty(productAttribute.code)) {
                                if (!formattedContent.attributeRows[formattedContent.attributeIndices[productAttribute.code]][product.ProductCode]) {
                                    formattedContent.attributeRows[formattedContent.attributeIndices[productAttribute.code]].attributeValues[productIterator] = {
                                        ProductCode: product.ProductCode,
                                        attributeCode: productAttribute.code,
                                        userValues: productAttribute.userValues,
                                        dataType: productAttribute.dataType,
                                        inputType: productAttribute.inputType
                                    };
                                    formattedContent.attributeRows[formattedContent.attributeIndices[productAttribute.code]].productCodes.push(product.ProductCode);
                                }
                            } else {
                                formattedContent.attributeRows.push({
                                    label: productAttribute.label,
                                    productCodes: [],
                                    attributeValues: Array.apply(null, Array(products.length)).map(function () { 
                                        return {
                                            ProductCode: '',
                                            attributeCode: '',
                                            userValues: '--',
                                            dataType: null,
                                            inputType: null
                                        };
                                    }),
                                    categoryDisplaySequence: attributeCategory.displaySequence,                                    
                                    attributeDisplaySequence: productAttribute.displaySequence,
                                    categoryName: attributeCategory.Name
                                });
                                attributeRowsLength = formattedContent.attributeRows.length;
                                formattedContent.attributeRows[attributeRowsLength - 1].attributeValues[productIterator] = {
                                    ProductCode: product.ProductCode,
                                    attributeCode: productAttribute.code,
                                    userValues: productAttribute.userValues,
                                    dataType: productAttribute.dataType,
                                    inputType: productAttribute.inputType
                                };
                                formattedContent.attributeRows[attributeRowsLength - 1].productCodes.push(product.ProductCode);
                                formattedContent.attributeIndices[productAttribute.code] = attributeRowsLength - 1;
                            }
                        });
                    }
                });
            }
        });
        // Sort by category displaySequence first, then by attribute displaySequence, then by label
        formattedContent.attributeRows = formattedContent.attributeRows.sort(function(x, y) {
            if (x.categoryDisplaySequence === y.categoryDisplaySequence) {
                if (x.attributeDisplaySequence < y.attributeDisplaySequence) {
                    return -1;
                } else {
                    return 1;
                }
            } else if (x.categoryDisplaySequence < y.categoryDisplaySequence) {
                return -1;
            } else if (x.categoryDisplaySequence > y.categoryDisplaySequence) {
                return 1;
            } else {
                if (x.label < y.label) {
                    return -1;
                } else {
                    return 1;
                }
            }
        });
        return formattedContent;
    }
    
    // $scope functions
    $scope.initCompareModal = function(content) {
        $scope.formattedContent = formatContent(content.recSet);
        $scope.$apply();
        console.log('formattedContent', $scope.formattedContent);
    };

    $scope.decideHtmlClasses = function() {
        var htmlClass = '';
        var constantClasses = 'slds-large-size--1-of-' + ($scope.formattedContent.topRow.length + 2) + ' slds-small-size--1-of-' + $scope.formattedContent.topRow.length + ' nds-large-size--1-of-' + ($scope.formattedContent.topRow.length + 2) + ' nds-small-size--1-of-' + $scope.formattedContent.topRow.length;
        if ($scope.formattedContent.topRow.length === 1) {
            htmlClass = constantClasses + ' slds-max-small-size--1-of-1 nds-max-small-size--1-of-1';
        } else if ($scope.formattedContent.topRow.length > 1) {
            htmlClass = constantClasses + ' slds-max-small-size--1-of-2 nds-max-small-size--1-of-2';
        }
        return htmlClass;
    };

    $scope.selectProductFromCompare = function(product) {
        var selectProductEvent = new CustomEvent('vloc-ins-os-product-details-compare-modal-select-product', {
            detail: {
                ProductCode: product.ProductCode
            }
        });
        document.dispatchEvent(selectProductEvent);
        $scope.cancel();
    };
}]);