/**
 * ProblemController
 *
 * @description :: Server-side logic for managing posts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var AdmZip = require('adm-zip');
var fs = require('fs');
var Promise = require('bluebird');
module.exports = {
    submissiondetail : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        Submission.findOne({'id':req.param('id')})
        .populate('id_user')
        .populate('id_problem')
        .exec(function(err,submission){
            if(err) return next(err);
            if(!submission) return res.redirect('/');
            if(req.session.User.id != submission.id_user.id){
                return res.redirect('/');
            }
            return res.view({submission:submission}); 
        });
    },
    create : function(req,res,next){
        if(!req.session.User.admin) return res.redirect('/');
        return res.view();  
    },
    publish : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        if(!req.session.User.admin) return res.redirect('/');
        Problem.update(req.param('id'),{publish:true}, function(err,problems){
            return res.redirect('/problem/list');
        }); 
    },
    get_submissions : function(req,res,next){
       Submission.find({'is_contest':false,'id_problem':req.param('id'), 'id_user':req.session.User.id})
        .populate('id_problem')
        .populate('id_user')
        .sort('createdAt DESC')
        .exec(function(err,submissions){
             if(err) return next(err); 
             return res.json({submissions:submissions});
        }); 
    },
    submissions : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        Submission.find({'is_contest':false,'id_problem':req.param('id'), 'id_user':req.session.User.id})
        .populate('id_problem')
        .populate('id_user')
        .sort('createdAt DESC')
        .exec(function(err,submissions){
             if(err) return next(err); 
             return res.view({submissions:submissions});
        });  
    },
    unpublish : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        if(!req.session.User.admin) return res.redirect('/');
        Problem.update(req.param('id'),{publish:false}, function(err,problems){
            return res.redirect('/problem/list');
        }); 
    },
    'create_problemsets' : function(req,res,next){
        if(!req.session.User.admin) return res.redirect('/');
        var stdin_file = req.param('file_url_1');
        var stdin_name = req.param('file_name_1');
        var stdout_file = req.param('file_url_2');
        var stdout_name = req.param('file_name_2');
        stdin_file = stdin_file.replace('data:application/zip;base64,', "");
        stdin_file = stdin_file.replace('data:application/x-rar;base64,', "");
        stdout_file= stdout_file.replace('data:application/zip;base64,', "");
        stdout_file = stdout_file.replace('data:application/x-rar;base64,', "")
        if(stdin_name==stdout_name){
            var sameNameError = ['File name for Testcase Input and Output should be different.']
            req.session.flash = {
                err: sameNameError,
            }
            res.redirect('/problem/create');
            return;
        }
        var usrObj = {
            name : req.param('name'),
            valName : req.param('problemID'),
            description : req.param('description'),
            timelimit : req.param('timelimit'),
            memorylimit : req.param('memorylimit'),
            difficulty : parseInt(req.param('difficulty')),
            input : [],
            output : []
        }
        Problem.findOne({'valName':req.param('problemID')}, function(err,problem1){
           if(err) return next(err);
           if(problem1){
                var sameNameError = ['The Problem ID has been exist. Please give another one.']
                req.session.flash = {
                    err: sameNameError,
                }
                res.redirect('/problem/create');
                return;
           }
           Problem.create(usrObj, function(err,problem){
                if(err) return next(err);
                //for input file
                var stdin = [];
                buf = new Buffer(stdin_file,'base64');
                fs.writeFile(stdin_name,buf, function(err,data){
                    if(err) return next(err);
                    var zip = new AdmZip(stdin_name);
                    var zipEntries = zip.getEntries(); // an array of ZipEntry records
                    zipEntries.forEach(function(zipEntry) {
                        if(!zipEntry.isDirectory && zipEntry.entryName.split('/')[0]!="__MACOSX" && zipEntry.entryName.split('/')[zipEntry.entryName.split('/').length-1]!=".DS_Store"){
                            stdin.push(zipEntry.getData().toString('utf-8'));
                        }
                    });
                    Problem.update(problem.id, {input:stdin}, function(err,prob){}); 
                    fs.unlink(stdin_name);
                });
                //for output file
                var stdout = [];
                buf2 = new Buffer(stdout_file,'base64');
                fs.writeFile(stdout_name,buf2, function(err,data){
                    if(err) return next(err);
                    var zip2 = new AdmZip(stdout_name);
                    var zipEntries2 = zip2.getEntries(); // an array of ZipEntry records
                    zipEntries2.forEach(function(zipEntry2) {
                        if(!zipEntry2.isDirectory && zipEntry2.entryName.split('/')[0]!="__MACOSX" && zipEntry2.entryName.split('/')[zipEntry2.entryName.split('/').length-1]!=".DS_Store"){
                            stdout.push(zipEntry2.getData().toString('utf-8'));
                        }
                    });
                    Problem.update(problem.id, {output:stdout}, function(err,prob){}); 
                    fs.unlink(stdout_name);
                });
                var createSuccess = ['Problem Set ', usrObj.name, ' has been created.'];
                req.session.flash = {
                success: createSuccess
                }
                return res.redirect('/problem/create');
            });  
        });
    },
    preview : function(req,res,next){
        if(typeof req.param('prob')=="undefined" || req.param('prob').length==0)
            return res.redirect('/');
        Problem.findOne({'valName':req.param('prob')}, function(err,problem){
            if(err) return next(err);
            if(!problem) return res.redirect('/');
            if(typeof req.param('idc')=="undefined" || req.param('idc').length==0) {
                return res.view({
                    problem : problem,
                    st : 0,
                }); 
            }
            else {
                return res.view({
                    problem : problem,
                    st : 1,
                    idc : req.param('idc')
                }); 
            }
        });
    },
    list : function(req,res,next) {
        var problemsPublish = [], problemNotPublish = [], problemSubs = [], indexLoop = 0;
        function add(problemsPublish, problemsNotPublish, n){
            indexLoop++;
            if(indexLoop==n)
            {
                return res.view({
                    problemsPublish : problemsPublish,
                    problemsNotPublish : problemsNotPublish,
                    problemSubs : problemSubs
                });
            }
        }
        Problem.find()
        .where({publish:true})
        .exec(function(err,problemPublish){
            Problem.find()
            .where({publish:false})
            .exec(function(err,problemNotPublish){
                   Submission.find({'result':1})
                   .groupBy('id_problem')
                   .sum('result')
                   .exec(function(err, SubmissionsSolved){
                       SubmissionsSolved.forEach(function(data) {
                            Submission.count({'id_problem':data.id_problem.toString()}).exec(function (err, problemSubsTotal) {
                                problemSubs[data.id_problem] = {'acc':data.result,'total':problemSubsTotal};
                                add(problemPublish, problemNotPublish, SubmissionsSolved.length);
                            });
                        });
                   });
            });    
        });
        // Promise.all([
        //     Problem.find().where({'publish':true}),
        //     Problem.find().where({'publish':false}),
        //     Submission.find().groupBy('id_problem').sum('result'),
        //     tmp
        // ])
        // .spread(function(ProblemPublish, ProblemNotPublish, SubmissionsSolved, Tmp){
        //     problemsPublish = ProblemPublish;
        //     problemsNotPublish = ProblemNotPublish;
        //     SubmissionsSolved.forEach(function(data) {
        //         Submission.count({'id_problem':data.id_problem.toString()}).exec(function (err, problemSubsTotal) {
        //             problemSubs[data.id_problem] = {'acc':data.result,'total':problemSubsTotal};
        //             xxx(problemSubs[data.id_problem]);
        //         });
        //     });
        // })
        // .catch(function(){
        //     return next(err);
        // })
        // .done(function(){
        //     console.log(tmp);
        //     return res.view({
        //         problemsPublish : problemsPublish,
        //         problemsNotPublish : problemsNotPublish,
        //         problemSubs : problemSubs
        //     });
        // });
        // .exec(function callBack(err, results) {
        //     if (err) return next(err);
        //     problemsPublish = results;
        // });
        // .where({'publish':true}).exec(function callBack(err,problems){
        //     if(err) return next(err);
        //     var problemsPublish = problems;
        // });
    }
};

