/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Promise = require('bluebird');
var Http = require('machinepack-http');
module.exports = {
    'profile' : function(req,res,next){
        User.findOne({where: { id: req.session.User.id }}).populate('university').exec(function (err, user){
            UserRating.find({where: { id_user: req.session.User.id }}).sort('date DESC').limit(10).exec(function(err,userRating) {
                userRating.sort(function(a, b) {
                    return a.date - b.date;
                });
                return res.view({
                    user: user,
                    userRating: userRating
                });
            });
        });
    },
    compile : function(req,res,next){
        if(typeof req.param('idProblem')=="undefined" || req.param('idProblem').length==0 || typeof req.param('code')=="undefined" || req.param('code').length==0)
            return res.redirect('/');
        Problem.findOne({'id':req.param('idProblem')}, function(err,problem){
            if(!problem) return res.redirect('/');
            var compile_output = [];
            var submit_on_contest = false;
            if(typeof req.param('idc')!="undefined" && req.param('idc').length!=0) {
                submit_on_contest = true;  
            }
            if(submit_on_contest){
                Contest.findOne({'id':req.param('idc')}, function(err,contest){
                   if(err) return next(err);
                   if(!contest) return res.redirect('/');
                   var obj = {
                        id_contest : req.param('idc'),
                        id_user : req.session.User.id,
                        id_problem : req.param('idProblem'),
                        output : [],
                        result : null,
                        minute : null,
                   }
                   Submission.find({ $and : [ {'id_contest' : req.param('idc')}, { 'id_user' : req.session.User.id }, {'id_problem':req.param('idProblem')} ] })
                   .exec(function(err,allsubs){
                        var has_solve = false;
                        for(var i=0;i<allsubs.length;i++){
                            if(allsubs[i].result){
                                has_solve = true;
                                break;
                            }
                        }
                        Submission.create(obj,function(err,submission){
                        var out = [];
                        function compile(input,i,n){
                                Http.sendHttpRequest({
                                url: '/compile',
                                baseUrl: 'http://api.mikelrn.com',
                                method: 'POST',
                                params: {language:7,code:req.param('code'),stdin:input},
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
                                //var out = sub.output;
                                    var usr = {
                                        idx : i,
                                        out : ans.output,
                                        ans : problem.output[i]
                                    }
                                    if(ans.output!=problem.output[i]){
                                        usr.result = 0
                                    } else {
                                        usr.result = 1
                                    }
                                    out.push(usr);
                                    if(out.length==n){
                                        var correct = true;
                                        for (var j=0;j<out.length;j++) {
                                            if (out[j].result != 1) {
                                                correct = false;
                                                break;
                                            }
                                        }
                                        if (correct) {
                                            Submission.update({'id':submission.id}, {'output':out, 'result':1, 'minute':Math.round((submission.createdAt - contest.datetimeopen)/60000)},function(err,su){});
                                            var user_contest = {
                                                id_contest : req.param('idc'),
                                                id_user : req.session.User.id
                                            }
                                            if(!has_solve) { 
                                                UserContest.findOne(user_contest, function(err,usercontest){
                                                    var solve = usercontest.solve + 1;
                                                    var score = usercontest.score + Math.round((submission.createdAt - contest.datetimeopen)/60000); 
                                                    UserContest.update(usercontest.id, {'solve':solve,'score':score}, function(err,usc){});
                                                }); 
                                            }
                                        } else {
                                            Submission.update({'id':submission.id}, {'output':out, 'result':0},function(err,su){});
                                        }
                                    }
                                },
                            });
                            }
                            for(var i=0;i<problem.input.length;i++){
                                compile(problem.input[i],i,problem.input.length);
                            }
                            return res.redirect('/contest/submission?idc='+contest.id+'&idp='+problem.id);
                    }); 
                   }); 
                });
            }
            else {
                function compile(input,i){
                    Http.sendHttpRequest({
                    url: '/compile',
                    baseUrl: 'http://api.mikelrn.com',
                    method: 'POST',
                    params: {language:7,code:req.param('code'),stdin:input},
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
                        if(ans.output==problem.output[i])
                            console.log("CORRECT");
                        else
                            console.log("WRONG ANSWER");
                    },
                });
                }
                for(var i=0;i<problem.input.length;i++){
                    compile(problem.input[i],i);
                }
                return res.redirect('back');
            }
            
        });
        
    },
    ranklist: function(req,res,next) {
        Promise.all([
            User.find().populate('university'),
            University.find()
        ]).spread(function(Users, Universities){
            users = Users;
            universities = Universities;
        })
        .catch(function(err){
            return next(err);
        })
        .done(function(){
            return res.view({
                users : users,
                universities : universities
            });
        });
        // User.find().populate('university').exec(function(err,users){
        //     if(err) return next(err);
        //     return res.view({
        //         users : users 
        //     });
        // });
    },
    rankUniversity: function(req,res,next) {
        Promise.all([
            University.find()
        ]).spread(function(Universities){
            universities = Universities;
        })
        .catch(function(err){
            return next(err);
        })
        .done(function(){
            return res.view({
                universities : universities
            });
        });
    }
};

