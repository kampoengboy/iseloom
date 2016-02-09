/**
 * ContestController
 *
 * @description :: Server-side logic for managing admins
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

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
    }
};

