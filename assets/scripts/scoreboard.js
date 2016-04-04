'use strict';

angular.module('scoreboard', [])

  .controller('MainCtrl', ['$scope','$http', function ($scope,$http) {
    $scope.contestants = [];
    $scope.universities = [];
    $scope.show_approval = false;
    $scope.contest = {};
    $scope.submissions = [];
    $scope.problems = [];
    $scope.users = [];
    function apply(){
        
    }
    var url = window.location.href.toString().split("/");
    function get_scoreboard(){
        $http.get('/contest/get_scoreboard/'+url[5])
        .then(function(response) {
            var res = response.data;
            var contestants = res.users;
            var universities = res.universities;
            var submissions = res.submissions;
            var problems = res.problems;
            var contest = res.contest;
            var show_approval = res.show_approval;
            var users = [];
            $scope.contestants = res.users;
            $scope.universities = res.universities;
            $scope.submissions = res.submissions;
            $scope.show_approval = res.show_approval;
            $scope.problems = res.problems;
            $scope.contest = res.contest;
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
                var problem = [];
                for(var j=0;j<problems.length;j++){
                    var res = false;
                    var tried = 0;
                    var min = 0;
                    var tmp = {};
                    for(var k=0;k<submissions.length;k++){
                        if(contest.freeze && ((contest.datetimeclose - submissions[k].createdAt) < contest.freezetime * 60000)) {
                            
                        } else {
                            if(submissions[k].id_user.id==contestants[i].id_user.id && submissions[k].id_problem.id==problems[j].id && !res){
                                if(submissions[k].result != null ) { 
                                    tried = tried + 1;
                                    if(submissions[k].result) {
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
            console.log(users);
            $scope.users = users;
        });
    }
    get_scoreboard();
    io.socket.get('/contest/subscribe_scoreboard', function(res){});
    io.socket.on('submission', function onServerSentEvent (msg) {
      switch(msg.verb) {
        case 'created':
         get_scoreboard();
         break;
        default: return;
      }
    });

}]);