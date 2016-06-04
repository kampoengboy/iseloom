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
.controller('RegisterCtrl', function($scope,$http,$ionicPopup,$ionicLoading,$ionicHistory) {
    $scope.universities = [];
    $scope.data = {};
    var url = 'http://localhost:1337/api/get_universities';
    $http.get(url).then(function(resp) {
            if(resp.data.code!=200){
                var alertPopup = $ionicPopup.alert({
                    title : 'Something Wrong',
                    template : resp.data.message
                });
            } else {
                $scope.universities = resp.data.universities;
            }
            // For JSON responses, resp.data contains the result
          }, function(err) {
            console.error('ERR', err);
            //reject('Login Failed.');
            // err.status will contain the status code
   })
   $scope.register = function(data){
     $ionicLoading.show({
        template: '<ion-spinner></ion-spinner> <br> Loading'
      });
     $http.post('http://localhost:1337/api/register', data)
      .success(function(datas){
          $ionicLoading.hide();
          if(datas.code!=200){
            var alertPopup = $ionicPopup.alert({
                title : 'Register Failed',
                template : datas.message
            });
          } else {
            var alertPopup = $ionicPopup.alert({
                title : 'Register Success',
                template : datas.message
            });
            $ionicHistory.goBack();
          }
      })
      .error(function(err){
        $ionicLoading.hide();
        var alertPopup = $ionicPopup.alert({
            title : 'Register Failed',
            template : 'Sorry, there is a problem with your connection'
        })
      })
   }
})
.controller('WelcomeCtrl', function($scope) {})
.controller('UpComingContestCtrl', function($scope) {
  $scope.playlists = [
    { title: 'MPC Challenge Part 2', id: 1 },
    { title: 'Ideafuse Part 2', id: 2 },
  ];
})
.controller('UpComingContestDetailCtrl', function($scope) {

})
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
    $state.go('app.dash');
  };
})
.controller('RanklistsCtrl', function($scope) {

})

.controller('ChatDetailCtrl', function($scope, $stateParams) {
})



.controller('AccountCtrl', function($scope,$http,AuthService,$ionicHistory, $ionicPopup,$ionicLoading) {
    $scope.labels = [];
    $scope.data = [];
    $scope.isLoggedIn = AuthService.isAuthenticated();
    var isLoggedIn = AuthService.isAuthenticated();
    console.log(AuthService.user());
    $scope.flag_nav = "hide";
    $scope.flag_chart = false;
    $scope.loading_chart_data = false;
    if(isLoggedIn) {
      $scope.flag_nav = "show";
      $scope.loading_chart_data = true;
      get_chart();
      $scope.user = AuthService.user();
    }
    function get_chart(){
          var url = 'http://localhost:1337/api/get_user_rating_chart/'+AuthService.user().username;
          $http.get(url).then(function(resp) {
            $scope.loading_chart_data = false;
            //console.log('Success', resp);
            if(resp.data.code!=200){
                var alertPopup = $ionicPopup.alert({
                    title : 'Something Wrong',
                    template : resp.data.message
                });
            } else {
                $scope.flag_chart = true;
                var rating = resp.data.userRating;
                var data = [];
                var labels = [];
                for(var i=0;i<rating.length;i++){
                  data.push(rating[i].rating);
                  var date = new Date(rating[i].date);
                  labels.push(date.getDate()+"-"+(date.getMonth()+1)+"-"+date.getFullYear())
                }
                $scope.data.push(data);
                $scope.labels = labels;
            }
            // For JSON responses, resp.data contains the result
          }, function(err) {
            $scope.loading_chart_data = false;
            console.error('ERR', err);
            //reject('Login Failed.');
            // err.status will contain the status code
          })
    }
    $scope.login = function(data){
      $ionicLoading.show({
        template: '<ion-spinner></ion-spinner> <br> Loading'
      });
      AuthService.login(data.email, data.password).then(function(authenticated){
          $ionicLoading.hide();
          $ionicHistory.nextViewOptions({
              disableBack: true
          });
          $scope.isLoggedIn = true;
          isLoggedIn = true;
          $scope.flag_nav = "show";
          $scope.loading_chart_data = true;
          $scope.user = AuthService.user();
          get_chart();
      }, function(err){
            $ionicLoading.hide();
      });
  }
});
