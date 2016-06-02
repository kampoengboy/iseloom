angular.module('starter')
.controller('LoginCtrl', function($scope,$ionicPopup,$state,$stateParams,AuthService,$ionicHistory) {
  $scope.login = function(data){
    AuthService.login(data.username, data.password).then(function(authenticated){
        $ionicHistory.nextViewOptions({
            disableBack: true
        });
        $state.go('app.dash');
        }, function(err){
        var alertPopup = $ionicPopup.alert({
            title : 'Register Gagal',
            template : 'Maaf, jaringan bermasalah. Silahkan mendaftarkan diri kembali.'
        });
    });
  }
})
.controller('RegisterCtrl', function($scope) {})
.controller('WelcomeCtrl', function($scope) {})
.controller('ScoreboardCtrl', function($scope) {
  $scope.ctrl = [];
  $scope.ctrl = [
    {
      rank : 1,
      univ: "Mikroskil",
      name : "Michael",
      solve : 2,
      score :200,
      hw : "2 (0+20)",
      mk : "1 (30)"
    },
    {
      rank : 2,
      univ: "Mikroskil",
      name : "Jeffry Tandiono",
      solve : 2,
      score :200,
      hw : "2 (0+20)",
      mk : "1 (30)"
    }
  ]
})
.controller('DashCtrl', function($scope) {
  $scope.playlists = [
    { title: 'MPC Challenge', id: 1 },
    { title: 'Ideafuse', id: 2 },
    { title: 'MPC New Year', id: 3 },
    { title: 'Ideafuse Warm Up', id: 4 },
  ];
})
.controller('OptionsCtrl', function($scope,$state,$ionicHistory,$ionicLoading,$timeout,$ionicPopup,$http,AuthService, ionicMaterialMotion, ionicMaterialInk){
  $scope.logout = function(){
    $ionicLoading.show({
      template: '<ion-spinner></ion-spinner> <br> Loading'
    });
    AuthService.logout();
    $ionicLoading.hide();
    $timeout(function () {
        $ionicHistory.clearCache();
        window.localStorage.removeItem("slides");
        window.localStorage.removeItem("list");
        $ionicHistory.clearHistory();
    },300)
    $state.go('welcome');
  };
})
.controller('ChatsCtrl', function($scope) {

})

.controller('ChatDetailCtrl', function($scope, $stateParams) {
})



.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
