/**
 * ProblemController
 *
 * @description :: Server-side logic for managing posts
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var AdmZip = require('adm-zip');
var fs = require('fs');
module.exports = {
    createproblemsets : function(req,res,next){
        if(!req.session.User.admin) return res.redirect('/');
        return res.view();  
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
            return res.send('Anda harus memasukkan nama file yang berbeda');
        }
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
            return res.redirect('/problem/createproblemsets');
        });
    }
};

