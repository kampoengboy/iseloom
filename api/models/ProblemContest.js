/**
* ProblemContest.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
      id_problem: {
        model: 'user'
      },
      id_contest: {
        model: 'contest'
      },
      order: 'integer'
  }
};

