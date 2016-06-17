angular.module('starter')
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
.controller('ScoreboardDetailCtrl', function($scope,$stateParams) {
    var contestant = JSON.parse($stateParams.contestant_obj);
    var problems = JSON.parse($stateParams.problems);
    var problems_from_contestant = contestant.problem;
    $scope.data = [];
    var data = [];
    for(var i=0;i<problems.length;i++){
        var obj = {};
        obj.problem = problems[i];
        if(problems_from_contestant[i]!=null){
            obj.res = problems_from_contestant[i];
            obj.has_submit = true
        } else {
            obj.res.tried = 0;
            obj.res.min = "-";
            obj.has_submit = false;
        }
        data.push(obj);
    }
    $scope.data = data;
})
.controller('EditProfileCtrl', function($scope,AuthService,$stateParams,$http,$ionicLoading,$ionicHistory,$ionicPopup) {
    $scope.universities = [];
    $scope.data = AuthService.user();
    $scope.data.university = $scope.data.university.val_name;
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
   $scope.editprofile = function(data){
       $ionicLoading.show({
            template: '<ion-spinner></ion-spinner> <br> Loading'
        });
       var obj = {
           id_user : AuthService.user().id,
           name : data.name,
           university : data.university
       }
       $http.post('http://localhost:1337/api/editprofile', obj)
        .success(function(datas){
            $ionicLoading.hide();
            if(datas.code!=200) {
               var alertPopup = $ionicPopup.alert({
                    title : 'Something Wrong',
                    template : resp.data.message
                });
              return;
            } else {
                console.log(datas);
                AuthService.changeProfile(datas.user);
                $ionicHistory.goBack();
            }
        })
        .error(function(err){
          $ionicLoading.hide();
           var alertPopup = $ionicPopup.alert({
                    title : 'Something Wrong',
                    template : resp.data.message
                });
          return;
        })
   }
})
.controller('ChangePasswordCtrl', function($scope,AuthService,$stateParams,$http,$ionicLoading,$ionicHistory,$ionicPopup) {
    $scope.data = {};
    $scope.changepassword = function(data){
        if(data.old_password==null || data.new_password==null){
            var alertPopup = $ionicPopup.alert({
                    title : 'Something Wrong',
                    template : 'Please fill the form completely'
                });
              return;
        }
       data.id_user = AuthService.user().id;
       $ionicLoading.show({
            template: '<ion-spinner></ion-spinner> <br> Loading'
        });
       $http.post('http://localhost:1337/api/changepassword', data)
        .success(function(datas){
            $ionicLoading.hide();
            if(datas.code!=200) {
               var alertPopup = $ionicPopup.alert({
                    title : 'Something Wrong',
                    template : resp.data.message
                });
              return;
            } else {
                $ionicHistory.goBack();
            }
        })
        .error(function(err){
          $ionicLoading.hide();
           var alertPopup = $ionicPopup.alert({
                    title : 'Something Wrong',
                    template : resp.data.message
                });
          return;
        })
   }
})
.controller('WelcomeCtrl', function($scope) {})
.controller('UpComingContestCtrl', function($scope,$http,$ionicLoading,$ionicPopup) {
          var url = 'http://localhost:1337/api/get_all_contest';
          var upcoming_contests = [];
          $http.get(url).then(function(resp) {
            if(resp.data.code!=200){
                var alertPopup = $ionicPopup.alert({
                    title : 'Something Wrong',
                    template : resp.data.message
                });
            } else {
                var contests = resp.data.contests;
                for(var i=0;i<contests.length;i++){
                    var now = new Date();
                    if(now < new Date(contests[i].datetimeopen) && now<new Date(contests[i].datetimeclose)){
                        upcoming_contests.push(contests[i]);
                    }
                }
                $scope.upcoming_contests = upcoming_contests;
            }
            // For JSON responses, resp.data contains the result
          }, function(err) {
            console.error('ERR', err);
            //reject('Login Failed.');
            // err.status will contain the status code
          })
})
.controller('UpComingContestDetailCtrl', function($scope,$stateParams,AuthService,$http, $ionicHistory, $ionicPopup) {
          $scope.isLoggedIn = AuthService.isAuthenticated();
          var isLoggedIn = AuthService.isAuthenticated();
          if(isLoggedIn) {
            $scope.user = AuthService.user();
          } else {
            $scope.user = null;
          }
          $scope.join_contest = function(){
              var url = 'http://localhost:1337/api/join_contest?idContest='+$scope.contest.id+'&idUser='+$scope.user.id;
                $http.get(url).then(function(resp) {
                        if(resp.data.code!=200){
                            var alertPopup = $ionicPopup.alert({
                                title : 'Something Wrong',
                                template : resp.data.message
                            });
                        } else {
                        var alertPopup = $ionicPopup.alert({
                            title : 'Success',
                            template : 'You have successfully join/unjoin contest.'
                        });
                        $ionicHistory.goBack();
                        }
                        // For JSON responses, resp.data contains the result
                    }, function(err) {
                        console.error('ERR', err);
                        //reject('Login Failed.');
                        // err.status will contain the status code
                })
          }
          $scope.unjoin_contest = function(){
              var url = 'http://localhost:1337/api/join_contest?idContest='+$scope.contest.id+'&idUser='+$scope.user.id;
                $http.get(url).then(function(resp) {
                        if(resp.data.code!=200){
                            var alertPopup = $ionicPopup.alert({
                                title : 'Something Wrong',
                                template : resp.data.message
                            });
                        } else {
                        var alertPopup = $ionicPopup.alert({
                            title : 'Success',
                            template : 'You have successfully join/unjoin contest.'
                        });
                        $ionicHistory.goBack();
                        }
                        // For JSON responses, resp.data contains the result
                    }, function(err) {
                        console.error('ERR', err);
                        //reject('Login Failed.');
                        // err.status will contain the status code
                })
          }
          var url = 'http://localhost:1337/api/get_contest?idContest='+$stateParams.contestId+'&idUser='+($scope.user ? $scope.user.id : null);
          $http.get(url).then(function(resp) {
            if(resp.data.code!=200){
                var alertPopup = $ionicPopup.alert({
                    title : 'Something Wrong',
                    template : resp.data.message
                });
            } else {
                $scope.join = (resp.data.userContest ? true : false);
                $scope.contest = resp.data.contest;
                var startOpen = new Date($scope.contest.datetimeopen);
                var startClose = new Date($scope.contest.datetimeclose);
                Number.prototype.padLeft = function(base,chr){
                  var  len = (String(base || 10).length - String(this).length)+1;
                  return len > 0? new Array(len).join(chr || '0')+this : this;
                };
                var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Des"];
                $scope.start = startOpen.getDate().padLeft() + " " + month[startOpen.getMonth()] + " " + startOpen.getHours().padLeft() + ":" + startOpen.getMinutes().padLeft() + ":" + startOpen.getSeconds().padLeft();
                $scope.end = startClose.getDate().padLeft() + " " + month[startClose.getMonth()] + " " + startClose.getHours().padLeft() + ":" + startClose.getMinutes().padLeft() + ":" + startClose.getSeconds().padLeft();
            }
            // For JSON responses, resp.data contains the result
          }, function(err) {
            console.error('ERR', err);
            //reject('Login Failed.');
            // err.status will contain the status code
          })
})
.controller('ScoreboardCtrl', function($scope,$interval,$state,$stateParams,$http,$ionicLoading,$ionicPopup) {
    var id = $stateParams.contestId;
    $scope.contestants = [];
    $scope.universities = [];
    $scope.show_approval = false;
    $scope.contest = {};
    $scope.submissions = [];
    $scope.problems = [];
    $scope.users = [];
    $scope.goto = function(obj){
        $state.go('app.scoreboarddetail/:contestant_obj/:problems',{contestant_obj:JSON.stringify(obj),problems:JSON.stringify($scope.problems)});
    }
    function get_scoreboard(){
        $http.get('http://localhost:1337/contest/get_scoreboard/'+id)
        .then(function(response) {
            var res = response.data;
            var contestants = res.users;
            var universities = res.universities;
            var submissions = res.submissions;
            var problems = res.problems;
            var contest = res.contest;
            var show_approval = res.show_approval;
            var users = [];
            var index = 0, totalindex = 0;
            var tempsolved = null, tempscore = null;
            $scope.contestants = res.users;
            $scope.universities = res.universities;
            $scope.submissions = res.submissions;
            $scope.show_approval = res.show_approval;
            $scope.problems = res.problems;
            $scope.contest = res.contest;
            $scope.now = new Date();
            Number.prototype.padLeft = function(base,chr){
              var  len = (String(base || 10).length - String(this).length)+1;
              return len > 0? new Array(len).join(chr || '0')+this : this;
            };
            var startOpen = new Date(res.contest.datetimeopen);
            var startClose = new Date(res.contest.datetimeclose);
            var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Des"];
            $scope.duration = startOpen.getDate().padLeft() + " " + month[startOpen.getMonth()] + " " + startOpen.getHours().padLeft() + ":" + startOpen.getMinutes().padLeft() + ":" + startOpen.getSeconds().padLeft() + " - " + startClose.getDate().padLeft() + " " + month[startClose.getMonth()] + " " + startClose.getHours().padLeft() + ":" + startClose.getMinutes().padLeft() + ":" + startClose.getSeconds().padLeft();
            var freeze = (res.contest.freeze && ((new Date(res.contest.datetimeclose) - new Date()) < res.contest.freezetime * 60000) ? true : false);
            $scope.freeze = freeze;
            for(var i=0;i<contestants.length;i++){
                var data = {};
                data.name = contestants[i].id_user.name;
                var elPos = universities.map(function(x) {return x.id; }).indexOf(contestants[i].id_user.university);
                data.university = universities[elPos].name;
                if(contest.freeze) {
                    data.solved = contestants[i].solvefreeze;
                    data.score = contestants[i].scorefreeze;
                }
                else {
                    data.solved = contestants[i].solve;
                    data.score = contestants[i].score;
                }
                totalindex++;
                if (i == 0) {
                    tempsolved = data.solved;
                    tempscore = data.score;
                    index++;
                } else if (data.solved != tempsolved || data.score != tempscore) {
                    index = totalindex;
                }
                data.index = index;
                var problem = [];
                for(var j=0;j<problems.length;j++){
                    var res = false;
                    var tried = 0;
                    var min = 0;
                    var tmp = {};
                    for(var k=0;k<submissions.length;k++){
                        if(contest.freeze && ((new Date(contest.datetimeclose).getTime() - new Date(submissions[k].createdAt).getTime()) < contest.freezetime * 60000)) {
                            
                        } else {
                            if(submissions[k].id_user.id==contestants[i].id_user.id && submissions[k].id_problem.id==problems[j].id && !res){
                                if(submissions[k].result != null ) { 
                                    tried = tried + 1;
                                    if(submissions[k].result==1) {
                                        min = submissions[k].minute;
                                        res = true;
                                    }
                                }
                            }
                        }
                        tmp.min = min;
                        tmp.tried = tried;
                        tmp.res = res;
                        if(tried) {
                            if(res) {
                                tmp.bg_color = "#00FF33";
                                tmp.color = "black";
                            }
                            else { 
                                tmp.bg_color = "#FF0000";
                                tmp.color = "white";
                            }
                        }
                        else {
                            tmp.bg_color = "";
                            tmp.color = "";
                        }
                    }
                    problem.push(tmp);
                }
                data.problem = problem;
                users.push(data);
            }
            $scope.users = users;
        });
    }
    var myFunctionToCall = ionic.throttle(get_scoreboard, 1000);
      $interval(function(){
        myFunctionToCall();
      }, 500);
})
.controller('DashCtrl', function($scope,$http,$ionicPopup, $ionicLoading,$interval) {
          var url = 'http://localhost:1337/api/get_all_contest';
          $scope.live_contests = [];
          function get_list_contest(){
          $http.get(url).then(function(resp) {
            var live_contests = [];
            if(resp.data.code!=200){
                var alertPopup = $ionicPopup.alert({
                    title : 'Something Wrong',
                    template : resp.data.message
                });
            } else {
                var contests = resp.data.contests;
                for(var i=0;i<contests.length;i++){
                    var now = new Date();
                    Number.prototype.padLeft = function(base,chr){
                      var  len = (String(base || 10).length - String(this).length)+1;
                      return len > 0? new Array(len).join(chr || '0')+this : this;
                    };
                    if(now <= new Date(contests[i].datetimeclose) && now>= new Date(contests[i].datetimeopen)){
                        var date = new Date(new Date(contests[i].datetimeclose) - now);
                        if(((date.getDay()-4) == 1 && date.getHours() >= 7) || (date.getHours() < 7 && (date.getDay()-4) == 2)) {
                            dformat = ((date.getHours() < 7) ? (date.getDay()-5) : (date.getDay()-4)) + " day " + [((date.getHours() < 7) ? (date.getHours() + 17) : (date.getHours() - 7)).padLeft(),
                                      date.getMinutes().padLeft(),
                                      date.getSeconds().padLeft()].join(':');
                        } else if((date.getDay()-4) > 0 && (date.getDay()-4) != 1) {
                            dformat = ((date.getHours() < 7) ? (date.getDay()-5) : (date.getDay()-4)) + " days " + [((date.getHours() < 7) ? (date.getHours() + 17) : (date.getHours() - 7)).padLeft(),
                                      date.getMinutes().padLeft(),
                                      date.getSeconds().padLeft()].join(':');
                        } else {
                            dformat = [((date.getHours() < 7) ? (date.getHours() + 17) : (date.getHours() - 7)).padLeft(),
                                      date.getMinutes().padLeft(),
                                      date.getSeconds().padLeft()].join(':');
                        }
                        live_contests.push({'contest':contests[i], 'timeleft': dformat});
                    }
                }
                $scope.live_contests = live_contests;
            }
            // For JSON responses, resp.data contains the result
          }, function(err) {
            console.error('ERR', err);
            //reject('Login Failed.');
            // err.status will contain the status code
          });
        }
    var myFunctionToCall = ionic.throttle(get_list_contest, 1000);
      $interval(function(){
        myFunctionToCall();
      }, 500);
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
.controller('RanklistsCtrl', function($scope,$http,$ionicLoading,$ionicPopup) {
    $scope.users = [];
    var url = 'http://localhost:1337/api/get_ranklists';
    $http.get(url).then(function(resp) {
            if(resp.data.code!=200){
                var alertPopup = $ionicPopup.alert({
                    title : 'Something Wrong',
                    template : resp.data.message
                });
            } else {
              var users = resp.data.usersRank;
              var res = [];
              for(var i=0;i<users.length;i++){
                  res.push(users[i]);
              }
              $scope.users = res;
            }
            // For JSON responses, resp.data contains the result
          }, function(err) {
            console.error('ERR', err);
            //reject('Login Failed.');
            // err.status will contain the status code
   })
})

.controller('JoinContestCtrl', function($scope,AuthService, $stateParams, $http,$ionicPopup, $ionicHistory) {
    $scope.isLoggedIn = AuthService.isAuthenticated();
    var isLoggedIn = AuthService.isAuthenticated();
    if(isLoggedIn) {
      $scope.user = AuthService.user();
    }
    var url = 'http://localhost:1337/api/join_contest?idContest='+$stateParams.contestId+'&idUser='+$scope.user.id;
    $http.get(url).then(function(resp) {
            if(resp.data.code!=200){
                var alertPopup = $ionicPopup.alert({
                    title : 'Something Wrong',
                    template : resp.data.message
                });
            } else {
              var users = resp.data.usersRank;
              var res = [];
              for(var i=0;i<users.length;i++){
                  res.push(users[i]);
              }
              $scope.users = res;
              var alertPopup = $ionicPopup.alert({
                  title : 'Success',
                  template : 'You have successfully join/unjoin contest.'
              });
              $ionicHistory.goBack();
            }
            // For JSON responses, resp.data contains the result
          }, function(err) {
            console.error('ERR', err);
            //reject('Login Failed.');
            // err.status will contain the status code
    })
})



.controller('AccountCtrl', function($scope,$http,AuthService,$ionicHistory, $ionicPopup,$ionicLoading) {
    $scope.labels = [];
    $scope.data = [];
    $scope.isLoggedIn = AuthService.isAuthenticated();
    var isLoggedIn = AuthService.isAuthenticated();
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
