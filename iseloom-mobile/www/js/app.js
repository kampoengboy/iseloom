// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic','ionic-material','chart.js'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js

  $ionicConfigProvider.navBar.alignTitle('left');
  $ionicConfigProvider.tabs.position('bottom');
  $stateProvider
  .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
    })
    .state('register', {
      url: '/register',
      templateUrl: 'templates/register.html',
      controller: 'RegisterCtrl'
    })
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'templates/welcome_page.html',
      controller : 'WelcomeCtrl'
    })
  // setup an abstract state for the tabs directive
    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('app.dash', {
    url: '/dash',
    views: {
      'app-dash': {
        templateUrl: 'templates/contests.html',
        controller: 'DashCtrl'
      }
    }
  })
  .state('app.scoreboard', {
    url: '/scoreboard/:contestId',
    views: {
      'app-dash': {
        templateUrl: 'templates/scoreboard.html',
        controller: 'ScoreboardCtrl'
      }
    }
  })
  .state('app.options', {
          url: 'app/options',
          views: {
              'app-account': {
                templateUrl: 'templates/options.html',
                controller : 'OptionsCtrl'
              }
          }
      })
  .state('app.ranklists', {
      url: '/ranklists',
      views: {
        'app-ranklists': {
          templateUrl: 'templates/ranklists.html',
          controller: 'RanklistsCtrl'
        }
      }
    })
    .state('app.upcoming_contest', {
      url: '/upcoming_contest',
      views: {
        'app-contest': {
          templateUrl: 'templates/upcoming_contest.html',
          controller: 'UpComingContestCtrl'
        }
      }
    })
    .state('app.upcoming_contest_detail', {
      url: '/upcoming_contest_detail',
      views: {
        'app-contest': {
          templateUrl: 'templates/upcoming_contest_detail.html',
          controller: 'UpComingContestDetailCtrl'
        }
      }
    })
  .state('app.account', {
    url: '/account',
    views: {
      'app-account': {
        templateUrl: 'templates/account.html',
        controller: 'AccountCtrl'
      }
    }
  })
   .state('app.register', {
      url: '/register',
      views: {
        'app-account': {
          templateUrl: 'templates/register.html',
          controller: 'RegisterCtrl'
        }
      } 
    });

  // if none of the above states are matched, use this as the fallback
    //$urlRouterProvider.otherwise('/app/dash');
    $urlRouterProvider.otherwise( function($injector, $location) {
      var $state = $injector.get("$state");
      $state.go("app.dash");
    });
})
