angular.module('starter')

.service('AuthService', function($q, $http, USER_ROLES,$ionicPopup) {
  var LOCAL_TOKEN_KEY = 'yourTokenKey';
  var user;
  var isAuthenticated = false;
  var role = '';
  var authToken;

  function loadUserCredentials() {
    var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      var x = JSON.parse(token);
      useCredentials(x);
    }
  }

  function storeUserCredentials(token) {
    window.localStorage.setItem(LOCAL_TOKEN_KEY, JSON.stringify(token));
    useCredentials(token);
  }

  function useCredentials(token) {
    user = token;
    isAuthenticated = true;
    authToken = token;

    if (token.admin) {
      role = USER_ROLES.admin
    }
    else {
      if (token.types == '1') {
        role = USER_ROLES.public
      } else {
        role = USER_ROLES.merchant
      }
    }
    // Set the token as header for your requests!
    //$http.defaults.headers.common['X-Auth-Token'] = JSON.stringify(token);
    //console.log($http.defaults.headers.common['X-Auth-Token']);
  }

  function destroyUserCredentials() {
    authToken = undefined;
    user = '';
    isAuthenticated = false;
    //$http.defaults.headers.common['X-Auth-Token'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  var login = function(name, pw) {
    return $q(function(resolve, reject) {
      var url = 'http://localhost:1337/api/login?email='+name+'&password='+pw;
      $http.get(url).then(function(resp) {
        //console.log('Success', resp);
        if(resp.data.code!=200){
            var alertPopup = $ionicPopup.alert({
                title : 'Login Failed',
                template : resp.data.message
            });
            reject('Login Failed.');
        } else {
            storeUserCredentials(resp.data.user);
            resolve('Login success.');
        }
        // For JSON responses, resp.data contains the result
      }, function(err) {
        console.error('ERR', err);
        reject('Login Failed.');
        // err.status will contain the status code
      })
      // if ((name == 'admin' && pw == '1') || (name == 'user' && pw == '1')) {
      //   // Make a request and receive your auth token from your server
      //   storeUserCredentials(name + '.yourServerToken');
      //   resolve('Login success.');
      // } else {
      //   reject('Login Failed.');
      // }
    });
  };

  var logout = function() {
    destroyUserCredentials();
  };

  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };

  loadUserCredentials();

  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;},
    user : function() {return user;},
    role: function() {return role;},
    isVerified : function(){return user.verification;},
    changeVerified : function(obj){
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
      user.verification = true;
      user.image = obj.image;
      user.gender = obj.gender;
      user.date_birth = obj.date_birth;
      storeUserCredentials(user);
    },
    changeProfile : function(obj){
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
      user.image = obj.image;
      user.gender = obj.gender;
      user.date_birth = obj.date_birth;
      user.phone = obj.phone;
      user.email = obj.email;
      storeUserCredentials(user);
    },
    changeOauth: function(obj){
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
      user.username = obj.username;
      user.date_birth = obj.date_birth;
      user.phone = obj.phone;
      user.qr_code = obj.qr_code;
      storeUserCredentials(user);
    },
    changePhone: function(newobj){
      window.localStorage.removeItem(LOCAL_TOKEN_KEY);
      user.phone = newobj.phone;
      storeUserCredentials(user);
    }
  };
})


.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated,
        403: AUTH_EVENTS.notAuthorized
      }[response.status], response);
      return $q.reject(response);
    }
  };
})
.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});
