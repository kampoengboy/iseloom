/**
 * Notification.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
      id_user : {
        model : 'user'
      },
      id_admin : {
        model : 'user'
      },
      id_contest : {
        model : 'contest'
      },
      read : {
        type : 'boolean',
        defaultsTo : false
      }
  }
};

