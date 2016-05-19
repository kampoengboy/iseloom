/**
* Problem.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      id_user : { //pembuat soal
          model : 'user'
      },
      id_category : {
          model : 'category'
      },
      name : 'string',
      valName : 'string',
      memorylimit : 'integer',
      timelimit : 'integer',
      description : 'string',
      input : 'array',
      output : 'array',
      category : 'array',
      difficulty : 'integer',
      publish : {
          type : 'boolean',
          defaultsTo : false
      }
  }
};

