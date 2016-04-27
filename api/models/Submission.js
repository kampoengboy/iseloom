/**
 * Submission.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
      id_contest : {
          model : 'contest'
      },
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
          defaultsTo : 0
      },
      is_contest : {
          type:'boolean',
          defaultsTo : false  
      },
      minute : {
          type : 'integer',
          defaultsTo : 0
      }
  }
};

