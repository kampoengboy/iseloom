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
            return res.view({
                user: user
            });
        })
    },
    compile : function(req,res,next){
        if(typeof req.param('idProblem')=="undefined" || req.param('idProblem').length==0 || typeof req.param('code')=="undefined" || req.param('code').length==0)
            return res.redirect('/');
        Problem.findOne({'id':req.param('idProblem')}, function(err,problem){
            if(!problem) return res.redirect('/');
            var compile_output = [];
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

