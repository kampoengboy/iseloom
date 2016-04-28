'use strict';

angular.module('submissions', [])

  .controller('MainCtrl', ['$scope','$http', function ($scope,$http) {
    var url = window.location.href.toString().split("/");
    $scope.submissions = [];
    var submissions = [];
    function get_submissions(){
        $http.get('/user/get_submissions')
        .then(function(response) {
            var res = response.data.subs;
            console.log(res);
            submissions = [];
            for(var i=0;i<res.length;i++){
                var ID_PROBLEM = res[i].id_problem.name;
                var datetime = res[i].createdAt;
                var result = res[i].result;
                var output = res[i].output;
                var data = {};
                data.id_problem = ID_PROBLEM;
                data.time = new Date(datetime).toString();
                data.result = result;
                data.output = output.length;
                submissions.push(data);
            }
            $scope.submissions = [];
            $scope.submissions = submissions;
        });  
    }
    get_submissions();
    io.socket.get('/contest/subscribe_scoreboard', function(res){});
    io.socket.on('submission', function onServerSentEvent (msg) {
      switch(msg.verb) {
        case 'created':
        if(msg.data.message==1) {
            get_submissions();
         }
         break;
        default: return;
      }
    });

}]);