/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      username : 'string',
      name : 'string',
      encryptedId : 'string',
      email : 'string',
      password : 'string',
      gender : 'string',
      verification : {
          type: 'boolean',
          defaultsTo : false
      },
      admin : {
          type: 'boolean',
          defaultsTo : false
      },
      rating : 'integer',
      highest_rating : 'integer',
      university : {
          model : 'university'
      }
  }
};

