/**
 * Clarification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
      id_contest : {
        model : 'contest'
      },
      id_user : {
        model : 'user'
      },
      id_admin : {
        model : 'user'
      },
      question : 'string',
      answer : 'string'
  }
};

