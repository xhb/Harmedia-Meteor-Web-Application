//want to at some point deal with page changes impacting navbar buttons being active

Template.nav.events({
  'click #logout': function() {
    var currentUserName = Meteor.user().username;
    Meteor.logout(function(err) {
      if (err) {
        console.log("Silly you are already logged out!");
      }
      else {
        console.log(currentUserName);
        Meteor.call('removeUserFromAllViewerList', currentUserName, function(err) {
          if (err) {
            console.log("Error removing user from all his/her lists!");
            Router.go("/");
          }
          else {
            console.log("User successfully removed from all his or her lists!");
            Session.set('currentChannel',null);
            Session.set("ses",false);
            Router.go("/");
          }
        });
      }
    });
  }
});

Template.nav.helpers({
  getCurrentUser: function() {
    return Meteor.user();
  }
});
