/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	createcontest : function(req,res,next){
        if(!req.session.User.admin) return res.redirect('/');
        return res.view();  
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
           return res.redirect('/admin/createcontest');
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
				res.redirect('/admin/dashboard');
				return;
            }
            User.update(user.id,{'verification':true}, function(err,user1){
               if(err) return next(err);
               return res.redirect('/admin/dashboard'); 
            });
        });
    },
    university : function(req,res,next) {
        if(!req.session.User.admin) return res.redirect('/');
        University.find(function(err,universities){
            if(err) return next(err);
            return res.view({
                universities : universities
            });
        });
    },
    'add_university' : function(req,res,next) {
        var universityObj = {
            name : req.param('name'),
            city : req.param('city'),
            country : req.param('country')
        }
        University.create(universityObj, function(err,university){
           if(err) return next(err);
            res.redirect('/admin/university');
        });
    }
};

