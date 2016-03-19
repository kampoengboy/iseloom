/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index : function(req,res,next){
   //      User.findOne({'username' : 'mike'}, function(err,user){
   //          if(err) return next(err);
			// var randomScalingFactor = function(){ return Math.round((Math.random()*100)+55)};
   //          var valObj = {
   //              id_user : user.id,
   //              rating : randomScalingFactor(),
   //              date : new Date().toJSON().slice(0,10)
   //          }
   //          UserRating.create(valObj, function(err,user){
   //              if(err) return next(err);
   //          });
   //      });
        var probs = [];
        Contest.findOne({'publish':true}, function(err,contest){
                if(err) return next(err);
                if(!contest) return res.view({
                     has_contest : false
                });
                ProblemContest.find({'id_contest':contest.id}, function(err,problems){
                    Problem.find(function(err,allproblem){
                         for(var i=0;i<problems.length;i++){
                            var elPos = allproblem.map(function(x) {return x.id; }).indexOf(problems[i].id_problem);
                            probs.push(allproblem[elPos]);
                         }
                         UserContest.find({'id_contest' : contest.id})
                         .populate('id_user')
                         .sort('solve DESC')
                         .sort('score ASC')
                         .exec(function(err,users){
                            University.find(function(err,universities){
                                Submission.find({'id_contest':contest.id})
                                .populate('id_user')
                                .populate('id_problem')
                                .exec(function(err,submissions){
                                   if(err) return next(err);
                                   return res.view({
                                        has_contest : true,
                                        universities : universities,
                                        submissions : submissions,
                                        contest : contest,
                                        problems : probs,
                                        users : users
                                    }); 
                                });
                            });
                         })
                    });
                    
                });
        });
    }
};

