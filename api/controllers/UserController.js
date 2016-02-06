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
    }
};

