/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
    'profile' : function(req,res,next){
        return res.view({
            user: req.session.User
        });
    },
    ranklist: function(req,res,next) {
        User.find(function(err,users){
            if(err) return next(err);
            return res.view({
                users : users 
            });
        });
    }
};

