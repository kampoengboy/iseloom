/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Promise = require('bluebird');
module.exports = {
	index : function(req,res,next){
       Promise.all([
            User.find().sort('rating DESC').populate('university').limit(10),
            Problem.find({publish : true}).limit(10),
            Submission.find({is_admin : false, is_contest : false}).sort('createdAt DESC'),
            University.find()
        ]).spread(function(Users, Problems, Submissions, Universities){
            users = Users;
            problems = Problems;
            submissions = Submissions;
            universities = Universities;
        })
        .catch(function(err){
            return next(err);
        })
        .done(function(){
            return res.view({
                submissions : submissions,
                problems : problems,
                users : users,
                universities : universities
            });
        });
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
        // var probs = [];
        // Contest.findOne({'publish':true}, function(err,contest){
        //         if(err) return next(err);
        //         if(!contest) return res.view({
        //              has_contest : false
        //         });
        //         ProblemContest.find({'id_contest':contest.id}, function(err,problems){
        //             Problem.find(function(err,allproblem){
        //                  for(var i=0;i<problems.length;i++){
        //                     var elPos = allproblem.map(function(x) {return x.id; }).indexOf(problems[i].id_problem);
        //                     probs.push(allproblem[elPos]);
        //                  }
        //                  UserContest.find({'id_contest' : contest.id})
        //                  .populate('id_user')
        //                  .sort('solve DESC')
        //                  .sort('score ASC')
        //                  .exec(function(err,users){
        //                     University.find(function(err,universities){
        //                         Submission.find({'id_contest':contest.id})
        //                         .populate('id_user')
        //                         .populate('id_problem')
        //                         .exec(function(err,submissions){
        //                            if(err) return next(err);
        //                            return res.view({
        //                                 has_contest : true,
        //                                 universities : universities,
        //                                 submissions : submissions,
        //                                 contest : contest,
        //                                 problems : probs,
        //                                 users : users
        //                             }); 
        //                         });
        //                     });
        //                  })
        //             });
                    
        //         });
        // });
    }
};

