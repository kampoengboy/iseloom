'use strict';

angular.module('submissions', [])

  .controller('MainCtrl', ['$scope','$http', function ($scope,$http) {
    var url = window.location.href.toString().split("/");
    var param = url[4].split("?");
    $scope.submissions = [];
    var submissions = [];
    function get_submissions(){
        $http.get('/user/get_submissions?'+param[1])
        .then(function(response) {
            var res = response.data.subs;
            subs = [];
            for(var i=0;i<res.length;i++){
                var ID_PROBLEM = res[i].id_problem.name;
                var datetime = res[i].createdAt;
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