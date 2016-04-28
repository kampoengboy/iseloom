/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Promise = require('bluebird');
var Http = require('machinepack-http');
var fs = require('fs');
module.exports = {
    search : function(req,res,next){
        var q = "";
        if(typeof req.param('q')!="undefined")
            q = req.param('q');
        User.find({verification:true,admin:false})
        .populate('university')
        .exec(function(err,users){
            if(err) return next(err);
            if(q=="") return res.view({result : [],q:""});
            var result = [];
            q = q.toLowerCase();
            for(var i=0;i<users.length;i++){
                //search username
                var username = users[i].username.toLowerCase();
                var found = false;
                for(var j=0;j<=username.length-q.length;j++){
                    var strtmp = username.substring(j,q.length);
                    if(strtmp == q){
                        found = true;
                        break;
                    }
                }
                if(found) result.push(users[i]);
                else {
                //search name
                    var name = users[i].name.toLowerCase();;
                    for(var j=0;j<=name.length-q.length;j++){
                        var strtmp = name.substring(j,q.length);
                        if(strtmp == q){
                            found = true;
                            break;
                        }
                    }
                    if(found) result.push(users[i]); 
                }
            }
            return res.view({result : result, q:q});  
        });  
    },
    testingaja : function(req,res,next){
        // var data = {
        //     name: req.param('name'),
        //     message: req.param('message')
        // };
        // User.create(data).exec(function created(err, message){
        //     User.publishCreate({id:message.id, name:message.name, message:message.message});
        // });
        var id = '56a9bafbb84196e4168c8090';
        User.update({username:'mikez'}, {name:'Michael'}).exec(function(err,user){
            User.publishCreate({id:id, name:'Michael'});
        });
    },
    subscribe : function(req,res,next){
        User.watch(req);  
    },
    'profile' : function(req,res,next){
        User.findOne({where: { username:  req.param('id')}}).populate('university').exec(function (err, user){
            if(err) return next(err);
            if(!user) return res.redirect('/');
            UserRating.find({where: { id_user: user.id }}).sort('date DESC').limit(10).exec(function(err,userRating) {
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
        if(typeof req.param('idProblem')=="undefined" || req.param('idProblem').length==0)
            return res.redirect('/');
         var text = "";
         if(req.param('type')=='1'){
            var tmp_file = req.param('file_url_1');
            var file = tmp_file.replace('data:application/octet-stream;base64,',""); 
            buf = new Buffer(file,'base64');
            var namefile = 'file-'+req.session.User.id+'.txt';
            fs.writeFile(namefile,buf,function(err,data){
                if(err) return next(err);
                var text = fs.readFileSync(namefile,'utf8');
                fs.unlink(namefile);
                if(text.length==0){
                    return res.redirect('/');
                }
                do_compile(text); 
            });     
         }
         else
         {
             if(typeof req.param('code')=="undefined") return res.redirect('/');
             text = req.param('code');
             do_compile(text);
         }
         function do_compile(text) {
         Problem.findOne({'id':req.param('idProblem')}, function(err,problem){
            if(!problem) return res.redirect('/');
            var compile_output = [];
            var submit_on_contest = false;
            if(typeof req.param('idc')!="undefined") {
                submit_on_contest = true;  
            }
            if(submit_on_contest){
                Contest.findOne({'id':req.param('idc')}, function(err,contest){
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
                    var cannot_submit = false;
                    if(!contest_start){
                        cannot_submit = true;
                    } else {
                        if(contest_end){
                            cannot_submit = true;
                        } else {
                            cannot_submit = false;
                        }
                    }
                   if(cannot_submit) {
                        var contestHasDone = ['Contest has done.'];
                        req.session.flash = {
                                err: contestHasDone
                        }
                        return res.redirect('/contest/scoreboard/'+req.param('idc'));
                    }
                   var obj = {
                        id_contest : req.param('idc'),
                        id_user : req.session.User.id,
                        code : text,
                        id_problem : req.param('idProblem'),
                        output : [],
                        is_contest : true,
                        result : null,
                        minute : null,
                   }
                   Submission.find({ $and : [ {'id_contest' : req.param('idc')}, { 'id_user' : req.session.User.id }, {'id_problem':req.param('idProblem')} ] })
                   .exec(function(err,allsubs){
                        var has_solve = false;
                        for(var i=0;i<allsubs.length;i++){
                            if(allsubs[i].result==1){
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
                                // console.log(ans);
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
                                                id_contest : req.param('idc'),
                                                id_user : req.session.User.id
                                            }
                                            if(!has_solve) { 
                                                UserContest.findOne({ $and : [ {'id_contest' : req.param('idc')}, { 'id_user' : req.session.User.id } ] }, function(err,usercontest){
                                                    Submission.find({ $and : [ {'id_contest' : req.param('idc')}, { 'id_user' : req.session.User.id }, {'id_problem':req.param('idProblem')}, {'result' : 0} ] }).exec(function(err,wrongsubs){
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
                            return res.redirect('/contest/submission?idc='+contest.id+'&idp='+problem.id);
                    }); 
                   }); 
                });
            }
            else {
                var obj = {
                        id_user : req.session.User.id,
                        code : text,
                        id_problem : req.param('idProblem'),
                        output : [],
                        result : null,
                        minute : null,
                }
                Submission.create(obj,function(err,submission){
                    var out = [];
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
                            // console.log(ans);
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
                                    Submission.update({'id':submission.id}, {'output':out, 'result':1},function(err,su){});    
                                } else {
                                    Submission.update({'id':submission.id}, {'output':out, 'result':code_flag},function(err,su){});
                                }
                                Submission.publishCreate({id:submission.id,message:1});
                            }
                        },
                    });
                    }
                    for(var i=0;i<problem.input.length;i++){
                        compile(problem.input[i],i,problem.input.length);
                    }
                    return res.redirect('/submissions');
                });
            }
        });
      }
    },
    ranklist: function(req,res,next) {
        Promise.all([
            User.find().sort('rating DESC').populate('university')
        ]).spread(function(Users){
            users = Users;
        })
        .catch(function(err){
            return next(err);
        })
        .done(function(){
            return res.view({
                users : users
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
        var universities = [], indexLoop = 0;
        function add(n){
            indexLoop++;
            if(indexLoop==n)
            {
                universities.sort(function(a,b) {
                    return parseFloat(b.rating/b.member) - parseFloat(a.rating/a.member);
                });
                return res.view({
                    universities : universities
                });
            }
        }
        //University yang tidak ada user harusnya tidak keluar
        User.find({'verification':true,admin:false}).groupBy('university').sum('rating').exec(function(err,ratingUniv) {
            ratingUniv.forEach(function(data) {
                University.findOne({'id':data.university.toString()}).exec(function(err, university) {
                    User.count({'university':data.university.toString(),'verification':true,admin:false}).exec(function(err, userCount) {
                        universities.push({'value':university.val_name,'name':university.name, 'rating':data.rating, 'member':userCount});
                        add(ratingUniv.length);
                    });
                });
            });
        });
        // Promise.all([
        //     University.find(),
        //     User.find({'verification':true,admin:false}).groupBy('university').sum('rating')
        // ]).spread(function(Universities,Users){
        //     universities = Universities;
        //     users = Users;
        // })
        // .catch(function(err){
        //     return next(err);
        // })
        // .done(function(){
        //     return res.view({
        //         users : users,
        //         universities : universities
        //     });
        // });
    },
    universityProfile: function(req,res,next) {
        University.findOne({'val_name':req.param('val')}).exec(function(err, university) {
            User.find({'university':university.id,'verification':true,'admin':false}).sort('rating DESC').exec(function(err,users) {
                return res.view({
                    university: university,
                    users: users
                });
            });
        });
    },
    submissions: function(req,res,next) {
        if(!req.session.authenticated) return res.redirect('/');
        User.findOne({'username':req.session.User.username}).exec(function(err, user) {
            Submission.find({'id_user':user.id, 'is_contest':false}).populate('id_problem').sort('createdAt DESC').exec(function(err, subs) {
                return res.view({
                    subs: subs
                });
            });
        });
    },
    'get_submissions' : function(req,res,next){
        User.findOne({'username':req.session.User.username}).exec(function(err, user) {
            Submission.find({'id_user':user.id, 'is_contest':false}).populate('id_problem').sort('createdAt DESC').exec(function(err, subs) {
                return res.json({
                    subs: subs
                });
            });
        });  
    },
    'subscribe_submissions' : function(req,res,next){
        Submission.watch(req);     
    }
};