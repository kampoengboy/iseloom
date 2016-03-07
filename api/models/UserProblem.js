/**
* UserProblem.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
  	  id_user : {
        model : 'user'
      },
      id_problem : {
      	model : 'problem'
      },
      id_contest : {
      	model : 'contest',
	    defaultsTo: null
      },
      status : 'integer',
      minute_contest : {
	    type: 'integer',
	    defaultsTo: null
	  },
	  date : 'datetime'
  }
};

