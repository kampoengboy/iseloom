/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var AdmZip = require('adm-zip');
var fs = require('fs');
module.exports = {
    createcontest : function(req,res,next){
        if(!req.session.User.admin) return res.redirect('/');
        return res.view();  
    },
    problemsets : function(req,res,next){
        if(!req.session.User.admin) return res.redirect('/');
        return res.view();  
    },
    'create_testcase' : function(req,res,next){
        if(!req.session.User.admin) return res.redirect('/');
        var stdin_file = req.param('file_url_1');
        var stdin_name = req.param('file_name_1');
        var stdout_file = req.param('file_url_2');
        var stdout_name = req.param('file_name_2');
        stdin_file = stdin_file.replace('data:application/zip;base64,', "");
        stdin_file = stdin_file.replace('data:application/x-rar;base64,', "");
        stdout_file= stdout_file.replace('data:application/zip;base64,', "");
        stdout_file = stdout_file.replace('data:application/x-rar;base64,', "");
        var usrObj = {
            name : req.param('name'),
            description : req.param('description'),
            timelimit : req.param('timelimit'),
            memorylimit : req.param('memorylimit'),
            input : [],
            output : []
        }
        Problem.create(usrObj, function(err,problem){
            if(err) return next(err);
            //for input file
            buf = new Buffer(stdin_file,'base64');
            fs.writeFile(stdin_name,buf, function(err,data){
                if(err) return next(err);
                var zip = new AdmZip(stdin_name);
                var zipEntries = zip.getEntries(); // an array of ZipEntry records
                zipEntries.forEach(function(zipEntry) {
                    Problem.findOne(problem.id, function(err,prob){
                        if(err) return next(err);
                        var stdin = prob.input;
                        stdin.push(zipEntry.getData().toString('utf-8'));
                        Problem.update(prob.id, {input:stdin}, function(err,prob1){}); 
                    });
                });
                fs.unlink(stdin_name);
            });
            //for output file
            buf2 = new Buffer(stdout_file,'base64');
            fs.writeFile(stdout_name,buf2, function(err,data){
                if(err) return next(err);
                var zip2 = new AdmZip(stdout_name);
                var zipEntries2 = zip2.getEntries(); // an array of ZipEntry records
                zipEntries2.forEach(function(zipEntry2) {
                    Problem.findOne(problem.id, function(err,prob){
                        if(err) return next(err);
                        var stdout = prob.output;
                        stdout.push(zipEntry2.getData().toString('utf-8'));
                        Problem.update(prob.id, {output:stdout}, function(err,prob1){}); 
                    });
                });
                fs.unlink(stdout_name);
            });
            return res.redirect('/user/problemsets');
        });
    },
    'create_contest' : function(req,res,next){
        if(!req.session.User.admin) return res.redirect('/');
        var usrObj = {
            name : req.param('contestname'),
            datetimeopen : req.param('datetimeopen'),
            datetimeclose : req.param('datetimeclose'),
            freezetime : parseInt(req.param('freezetime'))
        }
        Contest.create(usrObj, function(err,contest){
           if(err) return next(err); 
           return res.redirect('/user/createcontest');
        });
    },
	dashboard : function(req,res,next){
        if(!req.session.User.admin) return res.redirect('/');
        User.find(function(err,users){
            if(err) return next(err);
            return res.view({
                users : users 
            });
        });
    },
    'verify_user' : function(req,res,next){
        if(!req.session.User.admin) return res.redirect('/');
        User.findOne(req.param('idUser'), function(err,user){
            if(err) return next(err);
            if(!user){
                var noAccountError = [
				 'The user could not be find'
				]
				req.session.flash = {
					err: noAccountError,
				}
				res.redirect('/dashboard');
				return;
            }
            User.update(user.id,{'verification':true}, function(err,user1){
               if(err) return next(err);
               return res.redirect('/dashboard'); 
            });
        });
    }
};

