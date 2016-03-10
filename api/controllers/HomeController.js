/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	index : function(req,res,next){
   //      User.findOne({'username' : 'mike'}, function(err,user){
   //          if(err) return next(err);
			// var randomScalingFactor = function(){ return Math.round((Math.random()*100)+55)};
   //          var valObj = {
   //              id_user : user.id,
   //              rating : randomScalingFactor(),
   //              date : new Date().toJSON().slice(0,10)
   //          }
   //          UserRating.create(valObj, function(err,user){
   //              if(err) return next(err);
   //          });
   //      });
        return res.view();
    }
};

