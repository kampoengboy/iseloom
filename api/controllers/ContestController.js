/**
 * ContestController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');
var Http = require('machinepack-http');
module.exports = {
    recompile : function(req,res,next){
        Submission.findOne({'id':req.param('id')})
        .populate('id_problem')
        .populate('id_contest')
        .populate('id_user')
        .exec(function(err,submission){
            if(err) return next(err);
            var problem = submission.id_problem;
            var text = submission.code;
            var contest = submission.id_contest;
            var out = [];
            //Update Submission
            Submission.update(submission.id,{output:out}, function(err,subupdated){});
                Submission.find({ $and : [ {'id_contest' : submission.id_contest.id}, { 'id_user' : submission.id_user.id }, {'id_problem':submission.id_problem.id} ] })
                   .exec(function(err,allsubs){
                        var has_solve = false;
                        for(var i=0;i<allsubs.length;i++){
                            if(allsubs[i].result==1){
                                has_solve = true;
                                break;
                            }
                        }
                        function compile(input,i,n){
                                Http.sendHttpRequest({
                                url: '/compile',
                                baseUrl: 'http://api.mikelrn.com',
                                method: 'POST',
                                params: {language:7,code:text,stdin:input,memory_limit:problem.memorylimit},
                                formData: false,
                                headers: {},
                            }).exec({
                                // An unexpected error occurred.
                                error: function (err){
                                    console.log(err);
                                },
                                // 404 status code returned from server
                                notFound: function (result){
                                    console.log(result);
                                },
                                // 400 status code returned from server
                                badRequest: function (result){
                                    console.log(result);
                                },
                                // 403 status code returned from server
                                forbidden: function (result){
                                    console.log(result);
                                },
                                // 401 status code returned from server
                                unauthorized: function (result){
                                    console.log(result);
                                },
                                // 5xx status code returned from server (this usually means something went wrong on the other end)
                                serverError: function (result){
                                    console.log(result);
                                },
                                // Unexpected connection error: could not send or receive HTTP request.
                                requestFailed: function (err){
                                    console.log(err);
                                },
                                // OK.
                                success: function (result){
                                var ans = JSON.parse(result.body);
                                var flag = ans.flag;
                                if(flag==1 || flag==2 || flag==3){

                                } else {
                                    var tmp_time = ans.time.split('\n');
                                    var time = parseFloat(tmp_time[0]);
                                }
                                //console.log(ans);
                                // console.log(time);
                                //var out = sub.output;
                                    var usr = {
                                        idx : i,
                                        out : ans.output,
                                        ans : problem.output[i]
                                    }
                                    if(flag==0) {
                                        if(time>problem.timelimit+5){
                                            usr.result = 2;
                                        } else {
                                            if(ans.output!=problem.output[i]){
                                                usr.result = 0
                                            } else {
                                                usr.result = 1
                                            }
                                        }
                                    } else if(flag==1){
                                        //timeout
                                        usr.result = 2
                                    } else if(flag==2){
                                        //memory limit
                                        usr.result = 3;
                                    } else if(flag==3){
                                        //error
                                        usr.result = 4;
                                    }
                                    out.push(usr);
                                    if(out.length==n){
                                        var correct = true;
                                        var code_flag = 1;
                                        for (var j=0;j<out.length;j++) {
                                            if (out[j].result != 1) {
                                                correct = false;
                                                code_flag = out[j].result;
                                                break;
                                            }
                                        }
                                        if (correct) {
                                            Submission.update({'id':submission.id}, {'output':out, 'result':1, 'minute':Math.round((submission.createdAt - contest.datetimeopen)/60000)},function(err,su){});
                                            var user_contest = {
                                                id_contest : submission.id_contest.id,
                                                id_user : submission.id_user.id
                                            }
                                            if(!has_solve) {
                                                UserContest.findOne({ $and : [ {'id_contest' : submission.id_contest.id}, { 'id_user' : submission.id_user.id} ] }, function(err,usercontest){
                                                    var obj_contest_rules = {
                                                        $and : [
                                                            {'id_contest':submission.id_contest.id},
                                                            {'id_user':submission.id_user.id},
                                                            {'id_problem' : submission.id_problem.id},
                                                            {
                                                                $or : [
                                                                    {'result' : 0},
                                                                    {'result' : 2},
                                                                    {'result' : 3},
                                                                    {'result' : 4},
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                    Submission.find(obj_contest_rules).exec(function(err,wrongsubs){
                                                        if(err) return next(err);
                                                        var solve = usercontest.solve + 1;
                                                        var score = usercontest.score + Math.round((submission.createdAt - contest.datetimeopen)/60000) + (wrongsubs.length * 20);
                                                        if ((contest.datetimeclose - submission.createdAt) >= contest.freezetime * 60000) {
                                                            UserContest.update(usercontest.id, {'solvefreeze':solve,'scorefreeze':score,'tried':true}, function(err,usc){});
                                                        }
                                                        UserContest.update(usercontest.id, {'solve':solve,'score':score,'tried':true}, function(err,usc){});
                                                    });
                                                });
                                            }
                                        } else {
                                            Submission.update({'id':submission.id}, {'output':out, 'result':code_flag},function(err,su){});
                                        }
                                        Submission.publishCreate({id:submission.id,message:0});
                                    }
                                },
                            });
                }
                for(var i=0;i<problem.input.length;i++){
                    compile(problem.input[i],i,problem.input.length);
                }
                return res.redirect('/contest/allsubmission/'+contest.id);
            });    
        });
    },
	create : function(req,res,next) {
        if(!req.session.User.admin) return res.redirect('/');
        return res.view();
    },
    'done_contest' : function(req,res,next){

    },
    'make_clarification' : function(req,res,next){
        var usrObj = {
            id_user : req.session.User.id,
            question : req.param('question'),
            id_contest : req.param('idc')
        }
        Clarification.create(usrObj,function(err,clarification){
            if(err) return next(err);
            UserContest.find({'id_contest':req.param('idc')})
            .populate('id_user')
            .exec(function(err,users){
                for(var i=0;i<users.length;i++){
                    if(users[i].id_user.id == req.session.User.id) continue;
                    var obj = {
                        id_user : users[i].id_user.id,
                        id_contest : clarification.id_contest,
                    }
                    Notification.create(obj, function(err,notifications){});
                }
                User.find({'admin':true}, function(err,userss){
                    for(var i=0;i<userss.length;i++){
                        var obj = {
                            id_user : userss[i].id,
                            id_contest : clarification.id_contest,
                        }
                        Notification.create(obj, function(err,notifications){});
                    }
                    return res.redirect('/contest/clarification/'+req.param('idc'));
                });
            });
        });
    },
    'answer_clarification' : function(req,res,next){
        var usrObj = {
            answer : req.param('answer'),
            id_admin : req.session.User.id
        }
        Clarification.findOne({'id':req.param('idCl')},function(err,clarification){
            Clarification.update({'id':req.param('idCl')},usrObj, function(err,clarifications){});
            UserContest.find({'id_contest':clarification.id_contest})
            .populate('id_user')
            .exec(function(err,users){
                for(var i=0;i<users.length;i++){
                    var obj = {
                        id_user : users[i].id_user.id,
                        id_contest : clarification.id_contest,
                        id_admin : req.session.User.id,
                    }
                    Notification.create(obj, function(err,notifications){});
                }
                return res.redirect('/contest/clarification/'+clarification.id_contest);
            });
        });

    },
    clarification : function(req,res,next){
        Clarification.find({'id_contest':req.param('id')})
        .sort('createdAt DESC')
        .populate('id_contest')
        .exec(function(err,clarifications){
            if(err) return next(err);
            Notification.update({'id_contest':req.param('id'),'id_user':req.session.User.id}, {'read':true}, function(err,notification){});
            return res.view({clarifications : clarifications,id_contest:req.param('id')});
        });
    },
    'clarification_detail' : function(req,res,next){
        Clarification.findOne(req.param('id'), function(err,clarification){
            if(err) return next(err);
            if(!clarification) return res.redirect('/');
            return res.view({clarification:clarification});
        });
    },
    'get_notification' : function(req,res,next){
        if(req.session.authenticated){
            Notification.find({'id_contest':req.param('idc'),read:false,'id_user':req.session.User.id},function(err,notifications){
                return res.json({notifications : notifications.length});
            });
        } else {
            return res.json({notifications : 0})
        }
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
                    User.findOne({'id':contestant.id_user}, function(err,founduser){
                        User.update({'id':contestant.id_user}, {'rating':contestant.rating}, function(err,user){
                            if(founduser.highest_rating < contestant.rating) {
                                User.update({'id':contestant.id_user}, {'highest_rating':contestant.rating}, function(err,userupdated){});
                            }
                            var valObj = {
                                id_user : contestant.id_user,
                                rating : contestant.rating,
                                date : new Date().toJSON().slice(0,10)
                            }
                            UserRating.create(valObj, function(err,userrating){});
                        });
                    });    
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
                        if(users.length>1){
                            if(i==users.length-1){
                                if(users[i-1].solve==users[i].solve){
                                    if(users[i-1].score==users[i].score){
                                        data.rank = rank;
                                    }
                                    else {

                                        data.rank = rank;
                                        rank++;
                                    }
                                } else {

                                    data.rank = rank;
                                    rank++;
                                }
                            } else {
                                if(users[i].solve==users[i+1].solve){
                                    if(users[i].score==users[i+1].score){
                                        data.rank = rank;
                                    }
                                    else {

                                        data.rank = rank;
                                        rank++;
                                    }
                                } else {

                                    data.rank = rank;
                                    rank++;
                                }
                            }
                        } else {
                            data.rank = rank;
                        }
                        data.needRating = 0;
                        data.seed = 0;
                        data.delta = 0;
                        data.id_user = users[i].id_user.id;
                        // if(users[i].tried){
                        //     contestant.push(data);
                        // }
                        contestant.push(data);
                }
								contestant = elo_rating.process(contestant);
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
