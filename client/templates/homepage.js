var videoSessionList = {};
Template.homepage.helpers({
  getTop10Channels: function() {
    return Channels.find({}, {sort: {viewerCount: -1, channelURL: 1}});
  },
  getCurrentVideo: function(url) {
    return Meteor.call("getCurrentVideoForURL", url, function(error,result) {
      if (error || !result) {
        console.log("Unable to retrieve video");
        Session.set("currentVideo", result);
        videoSessionList[url] = Session.get("currentVideo");
      }
      else {
        console.log("Successfully obtained current video!");
        Session.set("currentVideo", result);
        videoSessionList[url] = Session.get("currentVideo");
      }
    });
  },
  getCurrentVideoSession: function(url) {
    return videoSessionList[url];
  }
});


Template.homepage.events({
});
