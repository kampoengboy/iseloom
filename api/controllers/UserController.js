/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var Http = require('machinepack-http');
module.exports = {
    'profile' : function(req,res,next){
        return res.view({
            user: req.session.User
        });
    },
    compile : function(req,res,next){
        Http.sendHttpRequest({
                url: '/compile',
                baseUrl: 'http://api.mikelrn.com',
                method: 'POST',
                params: {language:0,code:"print 'Hello!'",stdin:"hello"},
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
                  console.log(result);
                },
              });
    }
};

