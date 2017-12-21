angular.module('LogoutController', [])
  .controller('LogoutController', function($auth, $state) {
    if (!$auth.isAuthenticated()) {
      return;
    }
    $auth.logout()
      .then(function() {
        $state.go('login');
      });
  });
