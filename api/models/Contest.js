/**
* Contest.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      name : 'string',
      datetimeopen : 'date',
      datetimeclose : 'date',
      freezetime : 'integer',
      stop : {
        type : 'boolean',
        defaultsTo : false  
      },
      freeze : {
          type : 'boolean',
          defaultsTo : false
      }
  }
};

