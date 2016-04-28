'use strict';

angular.module('submissions', [])

  .controller('MainCtrl', ['$scope','$http', function ($scope,$http) {
    $scope.submissions = [];
    var submissions = [];
    function get_submissions(){
        $http.get('/user/get_submissions')
        .then(function(response) {
            var res = response.data.subs;
            submissions = [];
            for(var i=0;i<res.length;i++){
                var problem_name = res[i].id_problem.name;
                var datetime = res[i].createdAt;
                var result = res[i].result;
                var output = res[i].output;
                var data = {};
                data.problem = problem_name;
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
    io.socket.get('/user/subscribe_submissions', function(res){});
    io.socket.on('submission', function onServerSentEvent (msg) {
      switch(msg.verb) {
        case 'created':
        if(msg.data.message==0) {
            get_submissions();
         }
         break;
        default: return;
      }
    });

}]);