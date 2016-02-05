/**
* Problem.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      name : 'string',
      memorylimit : 'integer',
      timelimit : 'integer',
      description : 'string',
      input : 'array',
      output : 'array'
  }
};

