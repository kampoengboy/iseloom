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
    'create_contest' : function(req,res,next) {
        if(!req.session.User.admin) return res.redirect('/');
        var usrObj = {
            name : req.param('contestname'),
            datetimeopen : req.param('datetimeopen'),
            datetimeclose : req.param('datetimeclose'),
            freezetime : parseInt(req.param('freezetime'))
        }
        Contest.create(usrObj, function(err,contest){
           if(err) return next(err);
           return res.redirect('/contest/list');
        });
    },
    list : function(req,res,next) {
        Contest.find(function(err,contests){
            if(err) return next(err);
            return res.view({
                contests : contests 
            });
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
            var data = {
                name : req.param('contestname'),
                datetimeopen : req.param('datetimeopen'),
                datetimeclose : req.param('datetimeclose'),
                freezetime : parseInt(req.param('freezetime'))
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
        // if(!req.session.User.admin) return res.redirect('/');
        Contest.findOne(req.param('id'), function foundContest(err, contest) {
            if (err) return next(err);
            Promise.all([
                ProblemContest.find({ where: { id_contest: contest.id }, sort: 'order DESC'}).populate('id_problem'),
                Problem.find()
            ]).spread(function(ProblemsContest, ProblemsList){
                problemsContest = ProblemsContest;
                problemsList = ProblemsList;
            })
            .catch(function(){
                return next(err);
            })
            .done(function(){
                return res.view({
                    problemsContest : problemsContest,
                    problemsList : problemsList,
                    contestId : contest.id
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
        if(!req.session.User.admin) return res.redirect('/');
        Promise.all([
            Contest.findOne({ where: { id_contest: req.param('contestId') }}),
            Problem.findOne({ where: { valName: req.param('problems') }})
        ]).spread(function(Contest, Problem){
            contest = Contest;
            problem = Problem;
        })
        .catch(function(){
            return next(err);
        })
        .done(function(){
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
        // Contest.findOne(req.param('id'), function foundContest(err, contest) {
        //     if (err) return next(err);

        //     if (!contest) return next('Contest doesn\'t exist.');
        //     var data = {
        //         id_contest : contest.id,
        //         id_problem : req.param('problems'),
        //         datetimeclose : req.param('datetimeclose'),
        //         freezetime : parseInt(req.param('freezetime'))
        //     }
        //     Contest.update(req.param('id'), data, function contestUpdated(err) {
        //         if (err) return next(err);
        //     });

        //     var updateContestSuccess = ['Contest ', contest.name, ' has been updated.'];
        //     req.session.flash = {
        //        success: updateContestSuccess
        //     }
        //     res.redirect('/contest/list');
        // });
    }
};