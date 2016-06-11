/**
 * 
 *AdminController
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var bcrypt = require('bcrypt');
module.exports = {
    'add_admin' : function(req,res,next){
        var usrObj = {
            username : req.param('username'),
            email : req.param('email'),
            name : req.param('name'),
            verification : true,
            activation : true,
            admin : true,
            rating : 1500,
            highest_rating : 0,
        }  
        if(typeof req.param('username')=="undefined" || typeof req.param('email')=="undefined"){
            return res.redirect('/');
        }
        User.findOne({ or : [ {username : req.param('username')}, { email: req.param('email') } ] },function foundUser(err,user){
            if(err) return next(err);
            if(user) {
                var addAdminError = ['There has been user that has the same username or email.'];
                req.session.flash = {
                    err: addAdminError
                }
                return res.redirect('/admin/create_new_admin');
            }
            bcrypt.hash(req.param('password'), 10, function PasswordEncrypted(err, encryptedPassword) {
                usrObj.password = encryptedPassword;
                User.create(usrObj, function(err,users){
                    if(err) return next(err);
                    return res.redirect('/admin/dashboard'); 
                });
            });  
        });
    },
    'change_status' : function(req,res,next){
        User.findOne({'id':req.param('id')}, function(err,user){
            if(err) return next(err);
            if(!user) return res.redirect('/');
            var state = false;
            if(user.admin)
                state = false;
            else
                state = true;
            User.update(user.id, {admin:state}, function(err,users){
                if(err) return next(err);
                return res.redirect('/admin/dashboard'); 
            });
        });  
    },
    'create_new_admin' : function(req,res,next){
        if(!req.session.authenticated) return res.redirect('/');
        if(!req.session.User.admin) return res.redirect('/');
        return res.view();
    }, 
	dashboard : function(req,res,next){
        if(!req.session.User.admin) return res.redirect('/');
        User.find()
        .populate('university')
        .exec(function(err,users){
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
        var val_name = req.param('name').toLowerCase();
        var tmp = "";
        for(var i=0;i<val_name.length;i++){
            if(val_name[i]==' '){
                tmp+='_';
            } else {
                tmp+=val_name[i];
            }
        }
        var universityObj = {
            val_name : tmp,
            name : req.param('name'),
            city : req.param('city'),
            country : req.param('country')
        }
        University.create(universityObj, function(err,university){
           if(err) return next(err);
            return res.redirect('/admin/university');
        });
    }
};

