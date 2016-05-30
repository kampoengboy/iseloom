/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      username : {
        type: 'string',
        unique: true,
        required: true
      },
      name : 'string',
      encryptedId : {
        type: 'string',
        unique: true
      },
      email : {
        type: 'string',
        unique: true,
        required: true
      },
      password : 'string',
      gender : 'string',
      verification : {
          type: 'boolean',
          defaultsTo : false
      },
      activation : {
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

