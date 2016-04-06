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
    'done_contest' : function(req,res,next){

    },
    submissiondetail : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        if(!req.session.User.admin) return res.redirect('/');
        Submission.findOne({'id':req.param('id')})
        .populate('id_user')
        .populate('id_problem')
        .populate('id_contest')
        .exec(function(err,submission){
            if(err) return next(err);
            if(!submission) return res.redirect('/');
            return res.view({submission:submission}); 
        });
    },
    allsubmission : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        if(!req.session.User.admin) return res.redirect('/');
        Contest.findOne({'id':req.param('id')}, function(err,contest){
            if(err) return next(err);
            if(!contest) return res.redirect('/'); 
            return res.view({contest:contest});
        });
    },
    'get_allsubmission' : function(req,res,next){
        Submission.find({'id_contest':req.param('id')})
        .populate('id_user')
        .populate('id_contest')
        .populate('id_problem')
        .sort('createdAt DESC')
        .exec(function(err,submissions){
            return res.json({submissions : submissions}); 
        });
    },
    'apply_rating' : function(req,res,next){
        Contest.findOne({'id':req.param('id')}, function(err,contest){
            if(err) return next(err);
            if(!contest) return res.redirect('/');
            if(contest.approve) {console.log('yes'); return res.redirect('/contest/scoreboard/'+req.param('id'));}
             UserContest.find({'id_contest' : req.param('id')})
            .populate('id_user')
            .sort('solve DESC')
            .sort('score ASC')
            .exec(function(err,users){
                if(err) return next(err);
                function update_rating(contestant){
                    User.update({'id':contestant.id_user}, {'rating':contestant.rating}, function(err,user){
                        if(contestant.highest_rating < contestant.rating) {
                            User.update({'id':contestant.id_user}, {'highest_rating':contestant.rating}, function(err,userupdated){});
                        }
                        var valObj = {
                            id_user : contestant.id_user,
                            rating : contestant.rating,
                            date : new Date().toJSON().slice(0,10)
                        }
                        UserRating.create(valObj, function(err,userrating){}); 
                    });
                }
                function getRatingtoRank(contestants,rank){
                    var left = 1;
                    var right = 8000;
                    while(right-left>1){
                        var mid = (left+right)/2;
                        if(getSeed(contestants,mid) < rank) right = mid;
                        else left = mid;
                    }
                    return left;
                }
                function getSeed(contestants, rating){
                    var extracontestant = {
                        party : 0,
                        rank : 0,
                        points : 0,
                        rating : rating
                    }
                    var result = 0;
                    for(var i=0;i<contestants.length;i++){
                        var Ra = contestants[i].rating;
                        var Rb = extracontestant.rating;
                        var e = 1.0 / Math.pow(10,( 1 + (Rb-Ra) / 400.0 ));
                        result += e;
                    }
                    return result;
                }
                var E = 0;
                var contestant = [];
                var new_rating = [];
                var rank = 1;
                for(var i=0;i<users.length;i++){
                        var data = {};
                        data.party = users.length;
                        // data.rank = i+1;
                        data.points = users[i].score;
                        data.rating = users[i].id_user.rating;
                        if(i!=users.length-1){
                            if(users[i].solve==users[i+1].solve){
                                if(users[i].score==users[i+1].score){
                                    data.rank = rank;
                                }
                                else {
                                    rank++;
                                    data.rank = rank;
                                }
                            } else {
                                rank++;
                                data.rank = rank;
                            }
                        } else {
                            if(users[i-1].solve==users[i].solve){
                                if(users[i-1].score==users[i].score){
                                    data.rank = rank;
                                }
                                else {
                                    rank++;
                                    data.rank = rank;
                                }
                            } else {
                                rank++;
                                data.rank = rank;
                            }
                        }
                        data.needRating = 0;
                        data.seed = 0;
                        data.delta = 0;
                        data.id_user = users[i].id_user.id;
                        if(users[i].tried){
                            contestant.push(data);
                        }
                }
                for(var i=0;i<contestant.length;i++){
                    contestant[i].seed = 1;
                    for(var j=0;j<contestant.length;j++){
                        if(i==j) continue;
                        else {
                            var Ra = contestant[i].rating;
                            var Rb = contestant[j].rating;
                            var e = 1.0 / Math.pow(10,( 1 + (Rb-Ra) / 400.0 ));
                            contestant[i].seed += e;
                        }
                    }
                }
                for(var i=0;i<contestant.length;i++){
                    var midRank = Math.sqrt(contestant[i].rank * contestant[i].seed);
                    contestant[i].needRating = getRatingtoRank(contestant,midRank);
                    contestant[i].delta = (contestant[i].needRating - contestant[i].rating) / 2;
                }
                contestant.sort(function(a, b) {
                        return b.rating - a.rating;
                });
                var sum = 0;
                for(var i=0;i<contestant.length;i++){
                    sum+=contestant[i].delta;
                }
                var inc = (-1*sum) / contestant.length - 1;
                for(var i=0;i<contestant.length;i++){
                    contestant[i].delta += inc;
                }
                var sum = 0;
                var zeroSumCount = Math.min(4 * Math.round(Math.sqrt(contestant.length)),contestant.length);
                for(var i=0;i<zeroSumCount;i++){
                    sum += contestant[i].delta;
                }
                var inc = Math.min( Math.max( (-1 * sum) / zeroSumCount , -10) , 0);
                for(var i=0;i<contestant.length;i++){
                    contestant[i].delta += inc;
                }
                for(var i=0;i<contestant.length;i++){
                    var dummy = {
                            id_user : contestant[i].id_user,
                            rating : contestant[i].rating + contestant[i].delta,
                    }
                    dummy.highest_rating = dummy.rating;
                    new_rating.push(dummy);
                }
                for(var i=0;i<new_rating.length;i++){
                    update_rating(new_rating[i]);
                }
                Contest.update({'id':req.param('id')}, {'approve':true,'stop':true}, function(err,contestsss){});
                return res.redirect('/contest/scoreboard/'+req.param('id'));
          });
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
    'get_submission' : function(req,res,next){
        Submission.find({ $and : [ {'id_contest' : req.param('idc')}, { 'id_user' : req.session.User.id }, {'id_problem':req.param('idp')} ] })
        .populate('id_contest')
        .populate('id_problem')
        .sort('createdAt DESC')
        .exec(
        function(err,submission){
            if(err) return next(err);
            if(!submission) return res.json({submissions:[]});
            return res.json({
                submissions : submission
            }) 
        });  
    },
    'subscribe_scoreboard' : function(req,res,next){
        Submission.watch(req);     
    },
    scoreboard : function(req,res,next){
        var probs = [];
        Contest.findOne({'id':req.param('id')}, function(err,contest){
            if(err) return next(err);
            if(!contest) return res.redirect('/');
            var datenow = new Date();
            var dateopen = new Date(contest.datetimeopen).getTime();
            var dateclose = new Date(contest.datetimeclose).getTime();
            //open_time
            var seconds_left_to_open = (dateopen - datenow) / 1000;
            days_to_open = parseInt(seconds_left_to_open / 86400);
            seconds_left_to_open = seconds_left_to_open % 86400;
            hours_to_open = parseInt(seconds_left_to_open / 3600);
            seconds_left_to_open = seconds_left_to_open % 3600;
            minutes_to_open = parseInt(seconds_left_to_open / 60);
            seconds_to_open = parseInt(seconds_left_to_open % 60);
            //close_time
            var seconds_left_to_close = (dateclose - datenow) / 1000;
            days_to_close = parseInt(seconds_left_to_close / 86400);
            seconds_left_to_close = seconds_left_to_close % 86400;
            hours_to_close = parseInt(seconds_left_to_close / 3600);
            seconds_left_to_close = seconds_left_to_close % 3600;
            minutes_to_close = parseInt(seconds_left_to_close / 60);
            seconds_to_close = parseInt(seconds_left_to_close % 60);
            var contest_start = true;
            if(days_to_open>0){
               contest_start = false;
            } else if(days_to_open < 0){
               contest_start = true;
            } else if(days_to_open==0){
               if(hours_to_open<=0 && minutes_to_open<=0 && seconds_to_open<=0)
                   contest_start = true;
               else
                   contest_start = false;
            }
            var contest_end = false;
            if(days_to_close>0){
               contest_end = false;
            } else if(days_to_close < 0){
               contest_end = true;
            } else if(days_to_close==0){
               if(hours_to_close<=0 && minutes_to_close<=0 && seconds_to_close<=0)
                  contest_end = true;
               else
                  contest_end = false;
            }
            var show_approval = false;
            if(!contest_start){
               show_approval = false;
            } else {
               if(contest_end){
                  show_approval = true;
               } else {
                  show_approval = false;
               }
            }
            ProblemContest.find({'id_contest':req.param('id')}, function(err,problems){
                Problem.find(function(err,allproblem){
                     for(var i=0;i<problems.length;i++){
                        var elPos = allproblem.map(function(x) {return x.id; }).indexOf(problems[i].id_problem);
                        probs.push(allproblem[elPos]);
                     }
                     if (contest.freeze) {
                        UserContest.find({'id_contest' : req.param('id')})
                         .populate('id_user')
                         .sort('solvefreeze DESC')
                         .sort('scorefreeze ASC')
                         .exec(function(err,users){
                            University.find(function(err,universities){
                                Submission.find({'id_contest':req.param('id')})
                                .populate('id_user')
                                .populate('id_problem')
                                .exec(function(err,submissions){
                                   if(err) return next(err);
                                   return res.view({
                                        show_approval : show_approval,
                                        universities : universities,
                                        submissions : submissions,
                                        contest : contest,
                                        problems : probs,
                                        users : users
                                    }); 
                                });
                            });
                         })
                     } else {
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
                                        show_approval : show_approval,
                                        universities : universities,
                                        submissions : submissions,
                                        contest : contest,
                                        problems : probs,
                                        users : users
                                    }); 
                                });
                            });
                         })
                     }
                });
                
            });
        });
    },
    'get_scoreboard' : function(req,res,next){
        var probs = [];
        Contest.findOne({'id':req.param('id')}, function(err,contest){
            if(err) return next(err);
            if(!contest) return res.json({code:2});
            var datenow = new Date();
            var dateopen = new Date(contest.datetimeopen).getTime();
            var dateclose = new Date(contest.datetimeclose).getTime();
            //open_time
            var seconds_left_to_open = (dateopen - datenow) / 1000;
            days_to_open = parseInt(seconds_left_to_open / 86400);
            seconds_left_to_open = seconds_left_to_open % 86400;
            hours_to_open = parseInt(seconds_left_to_open / 3600);
            seconds_left_to_open = seconds_left_to_open % 3600;
            minutes_to_open = parseInt(seconds_left_to_open / 60);
            seconds_to_open = parseInt(seconds_left_to_open % 60);
            //close_time
            var seconds_left_to_close = (dateclose - datenow) / 1000;
            days_to_close = parseInt(seconds_left_to_close / 86400);
            seconds_left_to_close = seconds_left_to_close % 86400;
            hours_to_close = parseInt(seconds_left_to_close / 3600);
            seconds_left_to_close = seconds_left_to_close % 3600;
            minutes_to_close = parseInt(seconds_left_to_close / 60);
            seconds_to_close = parseInt(seconds_left_to_close % 60);
            var contest_start = true;
            if(days_to_open>0){
               contest_start = false;
            } else if(days_to_open < 0){
               contest_start = true;
            } else if(days_to_open==0){
               if(hours_to_open<=0 && minutes_to_open<=0 && seconds_to_open<=0)
                   contest_start = true;
               else
                   contest_start = false;
            }
            var contest_end = false;
            if(days_to_close>0){
               contest_end = false;
            } else if(days_to_close < 0){
               contest_end = true;
            } else if(days_to_close==0){
               if(hours_to_close<=0 && minutes_to_close<=0 && seconds_to_close<=0)
                  contest_end = true;
               else
                  contest_end = false;
            }
            var show_approval = false;
            if(!contest_start){
               show_approval = false;
            } else {
               if(contest_end){
                  show_approval = true;
               } else {
                  show_approval = false;
               }
            }
            ProblemContest.find({'id_contest':req.param('id')}, function(err,problems){
                Problem.find(function(err,allproblem){
                     for(var i=0;i<problems.length;i++){
                        var elPos = allproblem.map(function(x) {return x.id; }).indexOf(problems[i].id_problem);
                        probs.push(allproblem[elPos]);
                     }
                     if (contest.freeze) {
                        UserContest.find({'id_contest' : req.param('id')})
                         .populate('id_user')
                         .sort('solvefreeze DESC')
                         .sort('scorefreeze ASC')
                         .exec(function(err,users){
                            University.find(function(err,universities){
                                Submission.find({'id_contest':req.param('id')})
                                .populate('id_user')
                                .populate('id_problem')
                                .exec(function(err,submissions){
                                   if(err) return next(err);
                                   return res.json({
                                        show_approval : show_approval,
                                        universities : universities,
                                        submissions : submissions,
                                        contest : contest,
                                        problems : probs,
                                        users : users
                                    }); 
                                });
                            });
                         })
                     } else {
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
                                   return res.json({
                                        show_approval : show_approval,
                                        universities : universities,
                                        submissions : submissions,
                                        contest : contest,
                                        problems : probs,
                                        users : users
                                    }); 
                                });
                            });
                         })
                     }
                });
                
            });
        });
    },
    'add_contestant' : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        Contest.findOne(req.param('id'), function (err, contest) {
            if (err) return next(err);
            if (!contest) return next('Contest doesn\'t exist.');
            var datenow = new Date();
            var dateopen = new Date(contest.datetimeopen).getTime();
            var dateclose = new Date(contest.datetimeclose).getTime();
            //open_time
            var seconds_left_to_open = (dateopen - datenow) / 1000;
            days_to_open = parseInt(seconds_left_to_open / 86400);
            seconds_left_to_open = seconds_left_to_open % 86400;
            hours_to_open = parseInt(seconds_left_to_open / 3600);
            seconds_left_to_open = seconds_left_to_open % 3600;
            minutes_to_open = parseInt(seconds_left_to_open / 60);
            seconds_to_open = parseInt(seconds_left_to_open % 60);
            //close_time
            var seconds_left_to_close = (dateclose - datenow) / 1000;
            days_to_close = parseInt(seconds_left_to_close / 86400);
            seconds_left_to_close = seconds_left_to_close % 86400;
            hours_to_close = parseInt(seconds_left_to_close / 3600);
            seconds_left_to_close = seconds_left_to_close % 3600;
            minutes_to_close = parseInt(seconds_left_to_close / 60);
            seconds_to_close = parseInt(seconds_left_to_close % 60);
            var contest_start = true;
            if(days_to_open>0){
               contest_start = false;
            } else if(days_to_open < 0){
               contest_start = true;
            } else if(days_to_open==0){
               if(hours_to_open<=0 && minutes_to_open<=0 && seconds_to_open<=0)
                   contest_start = true;
               else
                   contest_start = false;
            }
            var contest_end = false;
            if(days_to_close>0){
               contest_end = false;
            } else if(days_to_close < 0){
               contest_end = true;
            } else if(days_to_close==0){
               if(hours_to_close<=0 && minutes_to_close<=0 && seconds_to_close<=0)
                  contest_end = true;
               else
                  contest_end = false;
            }
            if(!contest_start) {
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
            } else {
                return res.send('Sorry, register of contestant has ended');
            }
        }); 
    },
    'remove_contestant' : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        Contest.findOne(req.param('id'), function (err, contest) {
            if (err) return next(err);
            if (!contest) return next('Contest doesn\'t exist.');
            var datenow = new Date();
            var dateopen = new Date(contest.datetimeopen).getTime();
            var dateclose = new Date(contest.datetimeclose).getTime();
            //open_time
            var seconds_left_to_open = (dateopen - datenow) / 1000;
            days_to_open = parseInt(seconds_left_to_open / 86400);
            seconds_left_to_open = seconds_left_to_open % 86400;
            hours_to_open = parseInt(seconds_left_to_open / 3600);
            seconds_left_to_open = seconds_left_to_open % 3600;
            minutes_to_open = parseInt(seconds_left_to_open / 60);
            seconds_to_open = parseInt(seconds_left_to_open % 60);
            //close_time
            var seconds_left_to_close = (dateclose - datenow) / 1000;
            days_to_close = parseInt(seconds_left_to_close / 86400);
            seconds_left_to_close = seconds_left_to_close % 86400;
            hours_to_close = parseInt(seconds_left_to_close / 3600);
            seconds_left_to_close = seconds_left_to_close % 3600;
            minutes_to_close = parseInt(seconds_left_to_close / 60);
            seconds_to_close = parseInt(seconds_left_to_close % 60);
            var contest_start = true;
            if(days_to_open>0){
               contest_start = false;
            } else if(days_to_open < 0){
               contest_start = true;
            } else if(days_to_open==0){
               if(hours_to_open<=0 && minutes_to_open<=0 && seconds_to_open<=0)
                   contest_start = true;
               else
                   contest_start = false;
            }
            var contest_end = false;
            if(days_to_close>0){
               contest_end = false;
            } else if(days_to_close < 0){
               contest_end = true;
            } else if(days_to_close==0){
               if(hours_to_close<=0 && minutes_to_close<=0 && seconds_to_close<=0)
                  contest_end = true;
               else
                  contest_end = false;
            }
            if(!contest_start){
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
            } else {
                return res.send('Sorry, register of contestant has ended');
            }
        }); 
    },
    'create_contest' : function(req,res,next) {
        if(!req.session.authenticated) return res.redirect('/');
        if(!req.session.User.admin) return res.redirect('/');
        var usrObj = {
            name : req.param('contestname'),
            datetimeopen : req.param('datetimeopen'),
            datetimeclose : req.param('datetimeclose'),
            freezetime : (req.param('freezetime') != '') ? parseInt(req.param('freezetime')) : null,
            freeze : (req.param('freezetime') != '') ? true : false,
        }
        Contest.create(usrObj, function(err,contest){
           if(err) return next(err);
           var obj = {
               id_contest : contest.id,
               board : [],
           }
           return res.redirect('/contest/list');
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
            var stop  = false;
            if(req.param('stop')=="true") stop = true;
            var publish = false;
            if(req.param('publish')=="true") publish = true;
            var data = {
                name : req.param('contestname'),
                datetimeopen : req.param('datetimeopen'),
                datetimeclose : req.param('datetimeclose'),
                freezetime : parseInt(req.param('freezetime')),
                stop : stop,
                publish : publish
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
                UserContest.find({ where : {id_contest:contest.id}}).populate('id_user'),
                University.find()
            ]).spread(function(ProblemsContest, ProblemsList, Users, UserContest,Universities){
                problemsContest = ProblemsContest;
                problemsList = ProblemsList;
                users = Users;
                userContest = UserContest;
                universities = Universities;
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
                    userContest : userContest,
                    universities : universities
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
    },
    'unfreeze' : function(req,res,next) {
        if(!req.session.authenticated) return res.redirect('/');
        if(!req.session.User.admin) return res.redirect('/');
        Contest.findOne(req.param('id'), function foundContest(err, contest) {
            if (err) return next(err);
            if (!contest) return next('Contest doesn\'t exist.');
            Contest.update(contest.id, {'freeze':false}, function(err,contest){
              return res.redirect('/contest/list');
            });
        });
    }
};