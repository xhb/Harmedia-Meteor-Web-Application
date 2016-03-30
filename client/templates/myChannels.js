Template.myChannels.helpers({
  getCurrentUsername: function() {
    return Meteor.user();
  },
  redirectHome: function() {
    Router.go('/');
  }
});
