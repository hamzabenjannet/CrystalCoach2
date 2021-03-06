'use strict';
/**
 * @ngdoc function
 * @name crystalcoachApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Manages authentication to any active providers.
 */
angular.module('crystalcoachApp')
  .controller('LoginCtrl', ['$q', '$firebaseObject', '$timeout', '$scope', 'auth', '$location',
    function($q, $firebaseObject, $timeout, $scope, auth, $location) {

      $scope.loginBtn = true;
      $scope.logoutBtn = true;

      auth.$onAuthStateChanged(function(authData) {
        if (authData) {
          console.log(' logged: ' + authData.uid);
          $scope.logoutBtn = true;
          $scope.loginBtn = false;
          $location.path('/account');
        }
      });

      $scope.goTo = function(dest) {
        $location.path('/' + dest);

      }

      function checkIfUserExists(authData) {
        var usersRef = rootRef.child('users');
        var users = $firebaseObject(usersRef);
        usersRef.child(authData.user.uid).once('value', function(snapshot) {
          var exists = (snapshot.val() !== null);
          userExistsCallback(authData, exists);
        });
      }

      function userExistsCallback(authData, exists) {
        if (exists) {
          console.log("User exists, signing user on")
        } else {
          createProfile(authData.user.email, authData.user)
        }
      }

      // SignIn with a Provider
      $scope.oauthLogin = function(provider) {
        auth.$signInWithPopup(provider)
          .then(function(authData) {
            checkIfUserExists(authData)
            redirect();
          })
          .catch(function(error) {
            console.log('login error');
            showError(error);
          })
      };

      // Autenthication with password and email
      $scope.passwordLogin = function(email, pass) {

        auth.$signInWithEmailAndPassword(email, pass)
          .then(function(authData) {
            redirect();
            console.log('logged');
          })
          .catch(function(error) {
            showError(error);
            console.log('error: ' + error);
          });
      };

      $scope.createAccount = function(email, pass, confirm) {
        $scope.err = null;

        if (!pass) {
          $scope.err = 'Please enter a password';
        } else if (pass !== confirm) {
          $scope.err = 'Passwords do not match';
        } else {
          auth.$createUserWithEmailAndPassword(email, pass)
            .then(function(userData) {
              console.log('User ' + userData.uid + ' created successfully');
              return userData;
            })
            .then(function(authData) {
              console.log('Logged user: ', authData.uid);
              createProfile(email, authData);
              redirect();
            })
            .catch(function(error) {
              console.error('Error: ', error);
              showError(error);
            });
        }
      };

      //todo wait till SDK 3.x support comes up to test
      function createProfile(email, user) {
        console.log("Creating new profile with ID: " + user.uid);
        console.log("Email: " + email);
        var newUserRef = rootRef.child('users').child(user.uid);
        var newUser = $firebaseObject(newUserRef);
        newUser.email = email;
        newUser.name = firstPartOfEmail(email);
        newUser.photoURL = 'http://publicdomainvectors.org/photos/abstract-user-flat-4.png',
          newUser.nutrition = {
            quick: [0, 0, 0, 0]
          }
        newUser.exists = true
        newUser.$save()
      }

      function firstPartOfEmail(email) {
        return ucfirst(email.substr(0, email.indexOf('@')) || '');
      }

      function ucfirst(str) {
        // inspired by: http://kevin.vanzonneveld.net
        str += '';
        var f = str.charAt(0).toUpperCase();
        return f + str.substr(1);
      }



      function redirect() {
        $location.path('/account');
      }

      function showError(err) {
        $scope.err = err;
        $("#errMessage").addClass("animated shake");
        $timeout(function() {
          $("#errMessage").removeClass("animated shake")
        }, 500);
      }


    }
  ]);
