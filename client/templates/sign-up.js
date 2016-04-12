Template.signUp.events({
  'submit #sign-up-form': function(e,t) {
    e.preventDefault();
    var tempUsername = t.find('#inputUsername').value;
    var tempEmail = t.find('#inputEmail').value;
    var tempPassword = t.find('#inputPassword').value;

    var username = tempUsername.trim();
    var email = tempEmail.trim();
    var password = tempPassword.trim();
    if (isValid(username,password)) {
      Session.set("signinValidationErrors",null);
      Accounts.createUser({email: email, username: username, password: password },
      function(err) {
        if (err) {
          Session.set("signinValidationErrors",true);
        }
        else {
          Session.set("signinValidationErrors",null);
          Router.go('/');
        }
      });
    }
    else {
      Session.set("signinValidationErrors",true);
    }
  }
});

Template.signUp.helpers({
  isThereSigninValidationErrors: function() {
    return Session.get("signinValidationErrors");
  },
  destroyed: function() {
    Session.set('signinValidationErrors', null);
  }
});

function isValid(s,val) {
    return (val.length >= 6 && validateNoSpaces(s) && validateUsernameLength(s))  ? true: false;
}


function validateUsernameLength(s) {
  return s.length >= 3;
}

function validateNoSpaces(s) {
  for (var val in s) {
    //console.log(val);
    if (s[val] === " ") {
      return false;
    }
  }
  return true;
}
