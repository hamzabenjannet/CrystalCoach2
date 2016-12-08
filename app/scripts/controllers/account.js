'use strict';
/**
 * @ngdoc function
 * @name muck2App.controller:AccountCtrl
 * @description
 * # AccountCtrl
 * Provides rudimentary account management functions.
 */
angular.module('crystalcoachApp')
    .controller('AccountCtrl', ['$scope', 'auth', 'currentAuth', '$firebaseArray', '$timeout', function(
        $scope,
        auth,
        currentAuth,
        $firebaseArray,
        $timeout
    ) {

        var query = rootRef.child('users').child(currentAuth.uid);
        var userInfo = $firebaseArray(query);

        $scope.user = {
            uid: currentAuth.uid,
            name: currentAuth.displayName,
            photo: currentAuth.photoURL,
            email: currentAuth.email,
            info: userInfo
        };


        $scope.authInfo = currentAuth;

        $scope.changePassword = function(oldPass, newPass, confirm) {
            $scope.err = null;

            if (!oldPass || !newPass) {
                error('Please enter all fields');

            } else if (newPass !== confirm) {
                error('Passwords do not match');

            } else {
                // New Method
                auth.$updatePassword(newPass).then(function() {
                    console.log('Password changed');
                }, error);

            }
        };

        $scope.changeEmail = function(newEmail) {
            auth.$updateEmail(newEmail)
                .then(function() {
                    console.log('email changed successfully');
                    success('Successfully changed email!');
                })
                .catch(function(error) {
                    console.log('Error: ', error);
                });
        };

        $scope.logout = function() {
            auth.$signOut();
        };

        function error(err) {
            console.log('Error: ', err);
        }

        function success(msg) {
            alert(msg, 'success');
        }

        function alert(msg, type) {
            var obj = { text: msg + '', type: type };
            $scope.messages.unshift(obj);
            $timeout(function() {
                $scope.messages.splice($scope.messages.indexOf(obj), 1);
            }, 10000);
        }

        $scope.updateProfile = function(name, imgUrl) {
            firebase.auth().currentUser.updateProfile({
                    displayName: name,
                    photoURL: imgUrl
                })
                .then(function() {
                    console.log('updated');
                })
                .catch(function(error) {
                    console.log('error ', error);
                });
        };

        $scope.editModeOn = false;
        $scope.editMode = function() {
            $(".profile-form").toggle()
            if ($scope.editModeOn) {
                $("#profile-edit-btn").html('<i class="fa fa-pencil"></i> Edit')
                $("#profile-edit-btn").css({ color: '#aaa' })
                $scope.editModeOn = false;
            } else {
                $("#profile-edit-btn").html('<i class="fa fa-book"></i> Save Changes')
                $("#profile-edit-btn").css({ color: 'green' })
                $scope.editModeOn = true;
            }
        }
    }]);
