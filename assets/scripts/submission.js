'use strict';

angular.module('submission', [])

  .controller('MainCtrl', ['$scope','$http', function ($scope,$http) {
    var url = window.location.href.toString().split("/");
    var param = url[4].split("?");
    $scope.submissions = [];
    var submissions = [];
    function get_submission(){
        $http.get('/contest/get_submission?'+param[1])
        .then(function(response) {
            var res = response.data.submissions;
            submissions = [];
            for(var i=0;i<res.length;i++){
                var ID_PROBLEM = res[i].id_problem.valName;
                var time = res[i].createdAt;
                var result = res[i].result;
                var output = res[i].output;
                var data = {};
                data.id_problem = ID_PROBLEM;
                data.time = new Date(time).toString();
                data.result = result;
                data.output = output.length;
                submissions.push(data);
            }
            console.log(submissions);
            $scope.submissions = [];
            $scope.submissions = submissions;
        });  
    }
    get_submission();
    io.socket.get('/contest/subscribe_scoreboard', function(res){});
    io.socket.on('submission', function onServerSentEvent (msg) {
      switch(msg.verb) {
        case 'created':
        if(msg.data.message==0) {
            get_submission();
         }
         break;
        default: return;
      }
    });

}]);