/**
 * AdminController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
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

