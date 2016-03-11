/**
 * UserContest.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
       id_user : {
           model : 'user'
       },
       id_contest : {
           model : 'contest'
       },
       score : {
          type : 'integer',
          defaultsTo : null
       }
  }
};

