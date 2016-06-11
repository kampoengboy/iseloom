/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Promise = require('bluebird');
var Http = require('machinepack-http');
var fs = require('fs');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
module.exports = {
    testingsaja : function(req,res,next){
                var E = 0;
                var contestant = [];
                var new_rating = [];
                var rank = 1;
                var users = [];
                var obj1 = {
                    solve : 4,
                    score : 120,
                    rating : 1599,
                    name : 'A'
                }
                users.push(obj1);
                var obj2 = {
                    solve : 3,
                    score : 80,
                    rating : 1571,
                    name : 'B'
                }
                users.push(obj2);
                var obj3 = {
                    solve : 3,
                    score : 90,
                    rating : 1690,
                    name : 'C'
                }
                users.push(obj3);
                var obj4 = {
                    solve : 3,
                    score : 90,
                    rating : 1659,
                    name : 'D'
                }
                users.push(obj4);
                var obj5 = {
                    solve : 2,
                    score : 90,
                    rating : 1634,
                    name : 'E'
                }
                users.push(obj5);
                console.log(users);
                for(var i=0;i<users.length;i++){
                        var data = {};
                        data.party = users.length;
                        // data.rank = i+1;
                        data.points = users[i].score;
                        data.rating = users[i].rating;
                        data.name = users[i].name;
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
                        // if(users[i].tried){
                        //     contestant.push(data);
                        // }
                        contestant.push(data);
                }
                console.log('========');
                console.log(contestant);
                contestant = elo_rating.process(contestant);
                console.log("========setelah elo=========")
                console.log(contestant);
                for(var i=0;i<contestant.length;i++){
                    var dummy = {
                            rating : contestant[i].rating + contestant[i].delta,
                    }
                    dummy.highest_rating = dummy.rating;
                    new_rating.push(dummy);
                }
                console.log(new_rating);
    },
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
            file = file.replace('data:;base64,',"");
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
                        is_admin : (req.session.User.admin ? true : false),
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
                                                    var obj_contest_rules = {
                                                        $and : [
                                                            {'id_contest':req.param('idc')},
                                                            {'id_user':req.session.User.id},
                                                            {'id_problem' : req.param('idProblem')},
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
                        is_admin : (req.session.User.admin ? true : false),
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
        var usersRank = [], indexLoop = 0, tempTotal = 1, tempRank = 1, tempRating = 0;
        function add(n){
            indexLoop++;
            if(indexLoop==n)
            {
                return res.view({
                    usersRank : usersRank
                });
            }
        }
        User.find({'admin':false, 'verification':true, 'activation':true}).populate('university').sort('rating DESC').exec(function(err,users){
            if(err) return next(err);
            users.forEach(function(user) {
                if(usersRank.length == 0) tempRating = user.rating;
                if(user.rating != tempRating) {
                    tempRating = user.rating;
                    tempRank = tempTotal;
                }
                usersRank.push({'user':user, 'rank':tempRank});
                tempTotal++;
                add(users.length);
            });
        });
    },
    rankUniversity: function(req,res,next) {
        var universities = [], indexLoop = 0;
        function add(n){
            indexLoop++;
            if(indexLoop==n)
            {
                universities.sort(function(a,b) {
                    return b.rating - a.rating;
                });
                return res.view({
                    universities : universities
                });
            }
        }
        //University yang tidak ada user harusnya tidak keluar
        User.find({'verification':true,admin:false, 'activation':true}).groupBy('university').sum('rating').exec(function(err,ratingUniv) {
            ratingUniv.forEach(function(data) {
                University.findOne({'id':data.university.toString()}).exec(function(err, university) {
                    User.count({'university':data.university.toString(),'verification':true,admin:false, 'activation':true}).exec(function(err, userCount) {
                        universities.push({'value':university.val_name,'name':university.name, 'rating':Math.round(data.rating/userCount), 'member':userCount});
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
        var usersRank = [], university = null, indexLoop = 0, tempTotal = 1, tempRank = 1, tempRating = 0;
        function add(n){
            indexLoop++;
            if(indexLoop==n)
            {
                return res.view({
                    university: university,
                    usersRank : usersRank
                });
            }
        }
        University.findOne({'val_name':req.param('val')}).exec(function(err, universityFound) {
            university = universityFound;
            User.find({'university':university.id,'verification':true,'admin':false, 'activation':true}).sort('rating DESC').exec(function(err,users) {
                users.forEach(function(user) {
                    if(usersRank.length == 0) tempRating = user.rating;
                    if(user.rating != tempRating) {
                        tempRating = user.rating;
                        tempRank = tempTotal;
                    }
                    usersRank.push({'user':user, 'rank':tempRank});
                    tempTotal++;
                    add(users.length);
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
    },
    'resend_email' : function(req,res,next) {
        if(req.session.authenticated) return res.redirect('/');
        User.findOne({'email':req.param('email')}).exec(function(err, user) {
            if(!user) {
                var noUserError = ['No user found!'];
                  req.session.flash = {
                        err: noUserError
                  }
                return res.redirect('/login');
            }
            else if(user && user.activation && !user.verification) {
                var alreadyConfirmError = ['You have already confirm via email. Wait for admin to validate your account.'];
                  req.session.flash = {
                        err: alreadyConfirmError
                  }
                return res.redirect('/login');
            }
            else if(user && user.activation && user.verification) {
                var canLoginError = ['You have already confirm and validate. You can login now!'];
                  req.session.flash = {
                        err: canLoginError
                  }
                return res.redirect('/login');
            }
            var transporter = nodemailer.createTransport('smtps://iseloom.adm%40gmail.com:iseloomiseloom@smtp.gmail.com');
            var mailOptions = {
                from: 'Iseloom <iseloom.adm@gmail.com>', // sender address
                to: user.email, // list of receivers
                subject: 'Resend Activation Iseloom Account', // Subject line
                text: "Hola "+user.name+"\r\n\r\nPlease activate your account by clicking the link below.\r\n\r\n"+req.baseUrl+'/activate/'+user.encryptedId,
                html: "<h1>Hola "+user.name+"</h1>"+"<p>Please activate your account by clicking the button below.</p><a href='"+req.baseUrl+"/activate/"+user.encryptedId+"'><button>Click Here!</button></a>" // html body
            };
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
            });
            var emailSentSuccess = ['Email confirmation has been sent.'];
              req.session.flash = {
                    success: emailSentSuccess
              }
            return res.redirect('/login');
        });
    },
    'forgotpass' : function(req,res,next) {
        if(req.session.authenticated) return res.redirect('/');
        User.findOne({'email':req.param('email')}).exec(function(err, user) {
            if(!user) {
                var noUserError = ['No user found!'];
                  req.session.flash = {
                        err: noUserError
                  }
                return res.redirect('/login');
            }
            var transporter = nodemailer.createTransport('smtps://iseloom.adm%40gmail.com:iseloomiseloom@smtp.gmail.com');
            var mailOptions = {
                from: 'Iseloom <iseloom.adm@gmail.com>', // sender address
                to: user.email, // list of receivers
                subject: 'Reset Password Iseloom Account', // Subject line
                text: "Hola "+user.name+"\r\n\r\nPlease visit the link below to reset password Iseloom account.\r\n\r\n"+req.baseUrl+'/reset_password/'+user.encryptedId+'\r\n\r\nIgnore this message if you never forget password.',
                html: "<h1>Hola "+user.name+"</h1>"+"<p>Please click the button below to reset password Iseloom account.</p><a href='"+req.baseUrl+"/reset_password/"+user.encryptedId+"'><button>Click Here!</button></a><p>Ignore this message if you never forget password.</p>" // html body
            };
            transporter.sendMail(mailOptions, function(error, info){
                if(error){
                    return console.log(error);
                }
            });
            var emailSentSuccess = ['Email reset password has been sent.'];
              req.session.flash = {
                    success: emailSentSuccess
              }
            return res.redirect('/login');
        });
    },
    reset_password : function(req,res,next) {
        if(req.session.authenticated) return res.redirect('/');
        if(!req.param('id')) return res.redirect('/');
        User.findOne({'encryptedId' : req.param('id')}).exec(function(err, user) {
            if(!user) {
                var failError = ['No account found. Contact administrator.'];
                  req.session.flash = {
                        err: failError
                  }
                return res.redirect('/login');
            }
            res.view({
                user : user
            });
        });
    },
    'resetpassword' : function(req,res,next) {
        if(req.session.authenticated) return res.redirect('/');
        if(!req.param('id')) return res.redirect('/');
        if(req.param('password').trim()=="" || req.param('confirmationpassword').trim()=="") {
            var requireLoginError = ['Please fill the form completely.'];
            req.session.flash = {
                    err: requireLoginError
            }
            return res.redirect('/user/reset_password/'+req.param('id'));
        }
        if(req.param('password') != req.param('confirmationpassword')) {
            var failError = ['Password and Confirmation Password should be the same.'];
              req.session.flash = {
                    err: failError
              }
            return res.redirect('/user/reset_password/'+req.param('id'));
        }
        bcrypt.hash(req.param('password'), 10, function PasswordEncrypted(err, encryptedPassword) {
            bcrypt.hash(req.param('id'), 10, function IDEncrypted(err, encryptedId) {
                while(encryptedId.indexOf('/') > -1) {
                    var encryptedId = encryptedId.replace('/','');
                }
                User.update({'encryptedId':req.param('id')}, {'password':encryptedPassword, 'encryptedId':encryptedId}).exec(function(err, user) {
                    var resetSuccess = ['Password has been successfully reset. Try login with new password.'];
                      req.session.flash = {
                            success: resetSuccess
                      }
                    return res.redirect('/login');
                })
            });
        });
    },
    edit : function(req,res,next) {
        if(!req.session.authenticated) return res.redirect('/');
        User.findOne({'id' : req.session.User.id}).exec(function(err, user) {
            if(!user) {
                return res.redirect('/');
            }
            University.find(function(err,universities){
                res.view({
                    user: user,
                    universities: universities
                });
            });
        });
    },
    'edit_profile' : function(req,res,next) {
        if(!req.session.authenticated) return res.redirect('/');
        if(typeof req.param('edit') !== 'undefined') {
            University.findOne({'val_name':req.param('university')}, function(err,university){
                if (req.param('name') == req.session.User.name && university.id == req.session.User.university) {
                    var editError = ['Name and university don\'t change.'];
                      req.session.flash = {
                            err: editError
                      }
                    return res.redirect('/user/profile/'+req.session.User.username);
                }
                User.update({'id':req.session.User.id}, {'name':req.param('name'), 'university':university.id},function(err,user) {
                    req.session.User = user[0];
                    var editSuccess = ['Profile has been updated.'];
                      req.session.flash = {
                            success: editSuccess
                      }
                    return res.redirect('/user/profile/'+req.session.User.username);
                });
            });
        } else if (typeof req.param('edit_password') !== 'undefined') {
            bcrypt.compare(req.param('old_password'), req.session.User.password, function(err, valid) {
                if (err) return next(err);
                if (!valid) {
                    var passwordMismatchError = ['Your old password is wrong.']
                    req.session.flash = {
                        err: passwordMismatchError,
                    }
                    res.redirect('/user/profile/'+req.session.User.username);
                    return;
                }
                if(req.param('new_password').trim()=="" || req.param('retype_password').trim()==""){
                    var editPasswordError = ['Please fill the form completely.'];
                    req.session.flash = {
                            err: editPasswordError
                    }
                    return res.redirect('/user/profile/'+req.session.User.username);
                } else if(req.param('new_password')!=req.param('retype_password')){
                    var editPasswordError = ['Your new password and your retype new password is not same.'];
                    req.session.flash = {
                        err: editPasswordError
                    }
                    return res.redirect('/user/profile/'+req.session.User.username);
                } else {
                    bcrypt.hash(req.param('new_password'), 10, function PasswordEncrypted(err, encryptedPassword) {
                        User.update({'id':req.session.User.id}, {'password':encryptedPassword},function(err,user) {
                            req.session.User = user[0];
                            var editSuccess = ['Password has been changed.'];
                              req.session.flash = {
                                    success: editSuccess
                              }
                            return res.redirect('/user/profile/'+req.session.User.username);
                        });
                    });
                }
            });
        } else {
            return res.redirect('/');
        }
    }
};
