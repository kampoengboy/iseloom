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
    search : function(req,res,next){
        var q = "";
        if(typeof req.param('q')!="undefined")
            q = req.param('q');
        Problem.find({publish:true})
        .exec(function(err,problems){
            if(err) return next(err);
            if(q=="") return res.view({result : [],q:""});
            var result = [];
            q = q.toLowerCase();
            for(var i=0;i<problems.length;i++){
                //search name
                var name = problems[i].name;
                var found = false;
                for(var j=0;j<=name.length-q.length;j++){
                    var strtmp = name.substr(j,q.length);
                    if(strtmp == q){
                        found = true;
                        break;
                    }
                }
                if(found) result.push(problems[i]);
            }
            return res.view({result : result, q:q});
        });
    },
    'list_category' : function(req,res,next){
        Category.find(function(err,categories){
            if(err) return next(err);
            return res.view({categories : categories}); 
        });  
    },
    'add_category' : function(req,res,next){
        return res.view();  
    },
    'create_category' : function(req,res,next){
        var obj = {
            name : req.param('name')
        }
        Category.create(obj, function(err,category){
            if(err) return next(err);
            return res.redirect('/problem/list_category'); 
        });  
    },
    'edit_category' : function(req,res,next){
        Category.findOne({'id':req.param('id')}, function(err,category){
            if(err) return next(err);
            if(!category) return res.redirect('/');
            return res.view({category : category});
        }); 
    },
    'update_category' : function(req,res,next){
         var obj = {
            name : req.param('name')
        }
        Category.findOne({'id':req.param('id')}, function(err,category){
            if(err) return next(err);
            if(!category) return res.redirect('/');
            Category.update(category.id,obj, function(err,category){
                if(err) return next(err);
                return res.redirect('/problem/list_category'); 
            }); 
        }); 
    },
    'remove_category' : function(req,res,next){
        Category.findOne({'id':req.param('id')}, function(err,category){
            if(err) return next(err);
            if(!category) return res.redirect('/');
            Category.destroy(category.id,function(err,category){
                if(err) return next(err);
                return res.redirect('/problem/list_category'); 
            }); 
        }); 
    },
    submissiondetail : function(req,res,next){
        if(!req.session.authenticated || !req.session.User.admin) return res.redirect('/');
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
        if(!req.session.authenticated) return res.redirect('/');
        Category.find(function(err,categories){
            return res.view({categories : categories});  
        }); 
    },
    edit : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/'); 
        Problem.findOne({'id':req.param('id')}, function(err,problem){
            if(err) return next(err);
            if(!problem) return res.redirect('/');
            Category.find(function(err,categories){
                if(err) return next(err);
                if(req.session.User.admin || req.session.User.id==problem.id_maker){
                    return res.view({problem : problem, categories : categories});
                } else {
                    return res.redirect('/');
                }
            });
        });
    },
    'edit_problem' : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        Problem.findOne({'id':req.param('id')}, function(err,problem){
            if(err) return next(err);
            if(!problem) return res.redirect('/');
            if(req.session.User.admin || req.session.User.id == problem.id_maker){
                var stdin_file = req.param('file_url_1');
                var stdin_name = req.param('file_name_1');
                var stdout_file = req.param('file_url_2');
                var stdout_name = req.param('file_name_2');
                stdin_file = stdin_file.replace('data:application/zip;base64,', "");
                stdin_file = stdin_file.replace('data:application/x-rar;base64,', "");
                stdout_file= stdout_file.replace('data:application/zip;base64,', "");
                stdout_file = stdout_file.replace('data:application/x-rar;base64,', "");
                if(stdin_name.length!=0 && stdout_name.length!=0){
                    if(stdin_name==stdout_name){
                        var sameNameError = ['File name for Testcase Input and Output should be different.']
                        req.session.flash = {
                            err: sameNameError,
                        }
                        res.redirect('/problem/create');
                        return;
                    }
                    if(stdin_file.length!=0){
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
                    }
                    if(stdout_file.length!=0){
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
                    }
                }
                var category = [];
                if(typeof req.param('category')=="string"){
                    category.push(req.param('category'));
                } else if(typeof req.param('category')=="object"){
                    var tmp = req.param('category');
                    category = tmp;
                }
                var obj = {
                    name : req.param('name'),
                    valName : req.param('problemID'),
                    description : req.param('description'),
                    timelimit : req.param('timelimit'),
                    memorylimit : req.param('memorylimit'),
                    category : category,
                    id_maker : req.session.User.id,    
                }
                Problem.update(problem.id,obj,function(err,prob){
                    if(err) return res.redirect('/');
                    var createSuccess = ['Problem Set ', obj.name, ' has been edited.'];
                    req.session.flash = {
                        success: createSuccess
                    }
                    return res.redirect('back');
                });
            } else {
                return res.redirect('/');
            }
        });
    },
    remove_problem : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        Problem.findOne({'id':req.param('id')}, function(err,problem){
            if(err) return next(err);
            if(!problem) return res.redirect('/');
            if(req.session.User.admin || req.session.User.id == problem.id_maker){
                ProblemContest.findOne({'id_problem':problem.id}, function(err,problemContest){
                    if(err) return next(err);
                    if(problemContest) return res.send('The problem has been set to contest. Cannot be deleted');
                    else {
                        Submission.destroy({'id_problem':problem.id}, function(err, submssions){});
                        UserProblem.destroy({'id_problem':problem.id}, function(err, userproblem){});
                        Problem.destroy({'id':problem.id}, function(err,problems){});
                        return res.redirect('/');
                    }
                });
            } else {
                return res.redirect('/');
            }
        });  
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
        if(!req.session.authenticated || !req.session.User.admin) return res.redirect('/');
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
        if(!req.session.authenticated) return res.redirect('/');
        var stdin_file = req.param('file_url_1');
        var stdin_name = req.param('file_name_1');
        var stdout_file = req.param('file_url_2');
        var stdout_name = req.param('file_name_2');
        stdin_file = stdin_file.replace('data:application/zip;base64,', "");
        stdin_file = stdin_file.replace('data:application/x-rar;base64,', "");
        stdin_file = stdin_file.replace('data:document/unknown;base64,', "");
        stdout_file= stdout_file.replace('data:application/zip;base64,', "");
        stdout_file = stdout_file.replace('data:application/x-rar;base64,', "");
        stdout_file = stdout_file.replace('data:document/unknown;base64,', "");
        if(stdin_name==stdout_name){
            var sameNameError = ['File name for Testcase Input and Output should be different.']
            req.session.flash = {
                err: sameNameError,
            }
            res.redirect('/problem/create');
            return;
        }
        var publish = true;
        if(req.session.User.admin)
            publish = false;
        var category = [];
        if(typeof req.param('category')=="string"){
            category.push(req.param('category'));
        } else if(typeof req.param('category')=="object"){
            var tmp = req.param('category');
            category = tmp;
        }
        var usrObj = {
            name : req.param('name'),
            valName : req.param('problemID'),
            description : req.param('description'),
            timelimit : req.param('timelimit'),
            memorylimit : req.param('memorylimit'),
            category : category,
            id_user : req.session.User.id,
            input : [],
            output : [],
            publish : publish
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
        Problem.findOne({'valName':req.param('prob')}).populate('id_user').exec(function(err,problem){
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
        var start = 0;
        var page = 1;
        if(req.param('page')!=null){
            page = req.param('page');
        }
        start = (page-1)*10;
        var end = (page*10)-1;
        var prevpage = parseInt(page)-1;
        var nextpage = parseInt(page)+1;
        var problemsPublish = [], problemNotPublish = [], problemSubs = [], indexLoop = 0;
        function add(problemsPublish, problemsNotPublish, n){
            indexLoop++;
            if(indexLoop==n)
            {
                var tmp_problempublish = [];
                var tmp_problemsubs = [];
                for(var i=start;i<=end;i++){
                    if(problemsPublish[i]!=null)
                        tmp_problempublish.push(problemsPublish[i]);
                    else
                        break;
                }
                // for(var i=start;i<=end;i++){
                //     if(problemSubs[i]!=null)
                //         tmp_problemsubs.push(problemSubs[i]);
                //     else
                //         break;
                // }
                return res.view({
                    prevpage : prevpage,
                    page : page,
                    nextpage : nextpage,
                    problemsPublish : tmp_problempublish,
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
                   Submission.find({'result':1, 'is_admin':false, 'is_contest':false})
                   .groupBy('id_problem')
                   .sum('result')
                   .exec(function(err, SubmissionsSolved){
                        if(SubmissionsSolved.length == 0) {
                            return res.view({
                                problemsPublish : problemPublish,
                                problemsNotPublish : problemNotPublish,
                                problemSubs : problemSubs
                            });
                        }
                       SubmissionsSolved.forEach(function(data) {
                            Submission.count({'id_problem':data.id_problem.toString(), 'is_admin':false, 'is_contest':false}).exec(function (err, problemSubsTotal) {
                                if(req.session.authenticated) {
                                    Submission.findOne({'id_problem':data.id_problem.toString(),'result':1,'id_user':req.session.User.id, 'is_admin':false, 'is_contest':false}, function(err, hasacc){
                                        if(hasacc)
                                            problemSubs[data.id_problem] = {'acc':data.result,'total':problemSubsTotal,'state':1};
                                        else
                                            problemSubs[data.id_problem] = {'acc':data.result,'total':problemSubsTotal,'state':0}; 
                                        add(problemPublish, problemNotPublish, SubmissionsSolved.length);
                                    });
                                } else {
                                     problemSubs[data.id_problem] = {'acc':data.result,'total':problemSubsTotal};
                                     add(problemPublish, problemNotPublish, SubmissionsSolved.length);
                                }
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

