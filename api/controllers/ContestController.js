/**
 * ContestController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');
module.exports = {
	create : function(req,res,next) {
        if(!req.session.User.admin) return res.redirect('/');
        return res.view();  
    },
    'donecontest' : function(req,res,next){
          UserContest.find({'id_contest' : req.param('id')})
          .populate('id_user')
          .sort('solve DESC')
          .sort('score ASC')
          .populate('id_user')
          .exec(function(err,users){
              if(err) return next(err);
              function update_rating(contestant){
                  User.update({'id':contestant.id}, {'rating':contestant.rating}, function(err,user){});
              }
              var E = 0;
              var new_rating = [];
              for(var i=0;i<users.length;i++){
                  for(var j=0;j<users.length;j++){
                      if(i==j) continue;
                      else {
                          var Ra = users[i].id_user.rating;
                          var Rb = users[j].id_user.rating;
                          var e = 1 / ( 1 + (Rb-Ra) / 40 );
                          E+=e;
                      }
                  }
                  var seed = E + 1;
                  var rating = users[i].rating + (seed - i);
                  var d = (users[i].rating-rating)/2;
                  var contestant = {
                      id_user = users[i].id,
                      rating = users[i].rating+d
                  }
                  new_rating.push(contestant);
              }
              for(var i=0;i<new_rating.length;i++){
                  update_rating(new_rating[i]);
              }
              return res.redirect('/');
          });
    },
    submission : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        if(typeof req.param('idc')=="undefined" || typeof req.param('idp')=="undefined") return res.redirect('/');
        Submission.find({ $and : [ {'id_contest' : req.param('idc')}, { 'id_user' : req.session.User.id }, {'id_problem':req.param('idp')} ] })
        .populate('id_contest')
        .populate('id_problem')
        .sort('createdAt DESC')
        .exec(
        function(err,submission){
            if(err) return next(err);
            if(!submission) return res.redirect('/');
            return res.view({
                submissions : submission
            }) 
        });  
    },
    scoreboard : function(req,res,next){
        var probs = [];
        Scoreboard.findOne({'id_contest' : req.param('id')}, function(err,scoreboard){
            if(err) return next(err);
            if(!scoreboard) return res.redirect('/');
            Contest.findOne({'id':req.param('id')}, function(err,contest){
                if(err) return next(err);
                if(!contest) return res.redirect('/');
                ProblemContest.find({'id_contest':req.param('id')}, function(err,problems){
                    Problem.find(function(err,allproblem){
                         for(var i=0;i<problems.length;i++){
                            var elPos = allproblem.map(function(x) {return x.id; }).indexOf(problems[i].id_problem);
                            probs.push(allproblem[elPos]);
                         }
                         UserContest.find({'id_contest' : req.param('id')})
                         .populate('id_user')
                         .sort('solve DESC')
                         .sort('score ASC')
                         .exec(function(err,users){
                            University.find(function(err,universities){
                                Submission.find({'id_contest':req.param('id')})
                                .populate('id_user')
                                .populate('id_problem')
                                .exec(function(err,submissions){
                                   if(err) return next(err);
                                   return res.view({
                                        universities : universities,
                                        scoreboard : scoreboard,
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
        });
    },
    'add_contestant' : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        Contest.findOne(req.param('id'), function (err, contest) {
            if (err) return next(err);
            if (!contest) return next('Contest doesn\'t exist.');
            User.findOne({'id' : req.session.User.id}, function(err,user){
                if(err) return next(err);
                var valObj = {
                    id_contest : contest.id,
                    id_user : user.id,
                }
                UserContest.create(valObj, function(err,userContest){
                    if(err) return next(err);
                    return res.redirect('/contest/list');
                });
            });
        }); 
    },
    'remove_contestant' : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        Contest.findOne(req.param('id'), function (err, contest) {
            if (err) return next(err);
            if (!contest) return next('Contest doesn\'t exist.');
            User.findOne({'id' : req.session.User.id}, function(err,user){
                if(err) return next(err);
                var valObj = {
                    id_contest : contest.id,
                    id_user : user.id,
                }
                UserContest.destroy(valObj, function(err,userContest){
                    if(err) return next(err);
                    return res.redirect('/contest/list');
                });
            });
        }); 
    },
    'create_contest' : function(req,res,next) {
        if(!req.session.authenticated) return res.redirect('/');
        if(!req.session.User.admin) return res.redirect('/');
        var usrObj = {
            name : req.param('contestname'),
            datetimeopen : req.param('datetimeopen'),
            datetimeclose : req.param('datetimeclose'),
            freezetime : parseInt(req.param('freezetime'))
        }
        Contest.create(usrObj, function(err,contest){
           if(err) return next(err);
           var obj = {
               id_contest : contest.id,
               board : [],
           }
           Scoreboard.create(obj,function(err,scoreboard){
              if(err) return next(err);
              return res.redirect('/contest/list');
           });
        });
    },
    list : function(req,res,next) {
        Contest.find(function(err,contests){
            if(err) return next(err);
            userActiveContests = [];
            if (req.session.authenticated && !req.session.User.admin) {
                UserContest.find({where: { id_user: req.session.User.id }}).populate('id_contest').exec(function (err, userActiveContests){
                    var now = new Date();
                    var contestRegis = [];
                    for(var i=0;i<userActiveContests.length;i++){
                        contestRegis[userActiveContests[i].id_contest.id] = true;
                    }
                    if (err) return next(err);
                    return res.view({
                        contests : contests,
                        userActiveContests : userActiveContests,
                        now : now,
                        contestRegis : contestRegis
                    });
                });
            } else {
                return res.view({
                    contests : contests,
                    userActiveContests : userActiveContests
                });
            }
        });
    },
    remove: function(req, res, next) {
        if(!req.session.User.admin) {
            return res.redirect('/');
        }
        Contest.findOne(req.param('id'), function foundContest(err, contest) {
            if (err) return next(err);

            if (!contest) return next('Contest doesn\'t exist.');

            Contest.destroy(req.param('id'), function contestDestroyed(err) {
                if (err) return next(err);
            });

            var removeContestSuccess = ['Contest ', contest.name, ' has been removed.'];
            req.session.flash = {
               success: removeContestSuccess
            }
            res.redirect('/contest/list');
        });
    },
    edit: function(req,res,next) {
        if(!req.session.User.admin) {
            return res.redirect('/');
        }
        Contest.findOne(req.param('id'), function foundContest(err, contest) {
            if (err) return next(err);

            if (!contest) return next('Contest doesn\'t exist.');
            return res.view({
                contest : contest
            });
        });
    },
    'edit_contest' : function(req,res,next) {
        if(!req.session.User.admin) return res.redirect('/');
        Contest.findOne(req.param('id'), function foundContest(err, contest) {
            if (err) return next(err);

            if (!contest) return next('Contest doesn\'t exist.');
            var data = {
                name : req.param('contestname'),
                datetimeopen : req.param('datetimeopen'),
                datetimeclose : req.param('datetimeclose'),
                freezetime : parseInt(req.param('freezetime'))
            }
            Contest.update(req.param('id'), data, function contestUpdated(err) {
                if (err) return next(err);
            });

            var updateContestSuccess = ['Contest ', contest.name, ' has been updated.'];
            req.session.flash = {
               success: updateContestSuccess
            }
            res.redirect('/contest/list');
        });
    },
    problemset: function(req,res,next) {
        if(!req.session.User.admin) return res.redirect('/');
        Contest.findOne(req.param('id'), function foundContest(err, contest) {
            if (err) return next(err);
            Promise.all([
                ProblemContest.find({ where: { id_contest: contest.id }, sort: 'order ASC'}).populate('id_problem'),
                Problem.find(),
                User.find({where : { admin : false }}),
                UserContest.find({ where : {id_contest:contest.id}}).populate('id_user')
            ]).spread(function(ProblemsContest, ProblemsList, Users, UserContest){
                problemsContest = ProblemsContest;
                problemsList = ProblemsList;
                users = Users;
                userContest = UserContest;
            })
            .catch(function(){
                return next(err);
            })
            .done(function(){
                return res.view({
                    problemsContest : problemsContest,
                    problemsList : problemsList,
                    users : users,
                    contestId : contest.id,
                    userContest : userContest
                });
            });
            // ProblemContest.find({ where: { id_contest: contest.id }, sort: 'order DESC'}).exec(function (err, problems){
            //     if (err) return next(err);

            //     Problem.find();

            //     return res.view({
            //         problems : problems
            //     });
            // });
        });
    },
    'add_problem': function(req,res,next) {
        if(!req.session.authenticated) return res.redirect('/');
        if(!req.session.User.admin) return res.redirect('/');
        // Promise.all([
        //     Contest.findOne({ where: { id_contest: req.param('contestId') }}),
        //     Problem.findOne({ where: { valName: req.param('problems') }})
        // ]).spread(function(Contest, Problem){
        //     contest = Contest;
        //     problem = Problem;
        // })
        // .catch(function(){
        //     return next(err);
        // })
        // .done(function(){
        //     var valObj = {
        //         id_contest : contest.id,
        //         id_problem : problem.id,
        //         order : req.param('order')
        //     }
        //     console.log(req.param('contestId'));
        //     console.log(valObj);
        //     ProblemContest.create(valObj, function(err,problemContest){
        //        if(err) return next(err);
        //        return res.redirect('/contest/problemset/'+problemContest.id_contest);
        //     });
        // });
        Contest.findOne(req.param('id'), function (err, contest) {
            if (err) return next(err);
            if (!contest) return next('Contest doesn\'t exist.');
            Problem.findOne({valName : req.param('problems')}, function(err,problem){
                if(err) return next(err);
                var valObj = {
                    id_contest : contest.id,
                    id_problem : problem.id,
                    order : req.param('order')
                }
                ProblemContest.create(valObj, function(err,problemContest){
                    if(err) return next(err);
                    return res.redirect('/contest/problemset/'+problemContest.id_contest);
                });
            });
        });
    }
};