Template.loginForm.events({
  'submit #login-Form': function(e,t) {
    e.preventDefault();
    var email = t.find('#inputEmail').value.trim();
    var password = t.find("#inputPassword").value.trim();
    Meteor.loginWithPassword(email, password, function(err) {
      Session.set("loginValidationErrors", true);
      if (err) {
        Session.set("loginValidationErrors", true);
      }
      else {
        Session.set("loginValidationErrors", null);
        Router.go('/');
      }
    });
  }
});


Template.loginForm.helpers({
  isThereLoginValidationErrors: function() {
    return Session.get("loginValidationErrors");
  },
  destroyed: function() {
    Session.set("loginValidationErrors", null);
  }
});
