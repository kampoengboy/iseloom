/**
* SubmissionGlobal.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      id_problem : {
          model : 'problem'
      },
      id_user : {
          model : 'user'
      },
      code : 'string',
      output : 'array',
      result : {
          type : 'integer',
          defaultsTo : false
      },
      datetime : 'datetime'
  }
};

