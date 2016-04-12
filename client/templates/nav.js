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
            //Session.set('currentChannel',null);
            Session.set("ses",false);
            Router.go("/");
          }
        });
      }
    });
  },
  'click #deleteAccount': function() {
      var toDisplayAgain = 'y';
      while (toDisplayAgain.toLowerCase() === 'y' || toDisplayAgain.toLowerCase() === 'yes') {
        var inputUsername = prompt("Enter `"+ Meteor.user().username + "' and hit 'OK' to verify deleting your account!");
        if (inputUsername !== Meteor.user().username) {
          var toDisplayAgain = prompt("Incorrect username entered!  Would you like to try typing in your username again?");
        }
        else {
          //I want to delete the account now and everything associated with that account (viewerlist, channels, queue associated with channel and videos he has queued, remove them from banned users)
          Meteor.call('deleteUserAccount', Meteor.user().username,function(error) {
            if (error) {
              console.log("Unable to delete account!");
            }
            else {
              console.log("Account deleted!");
              Session.set("ses",false);
              Router.go("/");
              //would wnat to remove session here.
            }
          });
          break; //exiting loop
        }
    }
  }
});

Template.nav.helpers({
  getCurrentUser: function() {
    return Meteor.user();
  }
});
