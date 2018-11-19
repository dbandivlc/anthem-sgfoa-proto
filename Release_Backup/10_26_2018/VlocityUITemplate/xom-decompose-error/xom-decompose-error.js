vlocity.cardframework.registerModule
    .controller('decomposeValidateController',
                 ["$scope","$rootScope","$window","$location", function( $scope,$rootScope,$window,$location){
                     $scope.errMeg="";
             this.showValidateErrorMeg = function(erMessage,OrderId) {
              alert(erMessage);  
              var url = "https://" + $window.location.host + "/apex/HybridCPQ?id="+OrderId;
              $window.location.href = url;
        };
        
}]);