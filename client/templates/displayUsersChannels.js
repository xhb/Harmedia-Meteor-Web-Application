Template.displayUsersChannels.helpers({
    channelRow: function() {
      return Channels.find({}, {sort: {viewerCount: -1, channelURL: 1}});
    }
});


Template.displayUsersChannels.events({
  'click a.delete_button': function() {
    var toDelete = confirm("Are you sure you want to delete this channel?");
    if (toDelete === true) {
      Meteor.call('deleteUserChannel', this._id, function(error) {
        if (error) {
          console.log("Unable to delete!");
        }
        else {
          console.log("Success");
        }
      });
    }
    else {
      console.log("Not deleting your channel!");
    }
  }
});
