Meteor.publish('myChannels', function () {
  var userId = this.userId;
  return Channels.find({ownerID: userId });
});

Meteor.publish('getCurrentChannelData', function(cURL) {
  return Channels.find({channelURL: cURL});
});

Meteor.publish('getCurrentChannelsChat', function (cURL) {
  return ChannelsChat.find({ roomURLHandler: cURL });
});

Meteor.publish('getCurrentChannelViewerList', function (cURL) {
  return ChannelsViewerList.find({ roomURLHandler: cURL });
});

Meteor.publish('getCurrentChannelsModList', function(cURL) {
  return ChannelsModList.find({ roomURLHandler: cURL });
});

Meteor.publish('getCurrentChannelQueue', function(cURL) {
  return ChannelsQueue.find({ roomURLHandler: cURL });
});

Meteor.publish('top10Channels', function() {
    return Channels.find({}, {sort: {viewerCount: -1, channelURL: 1}}, {limit: 10}); //look at this
});

Meteor.publish('getAllChannels', function() {
  return Channels.find({}); //gets all the channels
});


Meteor.setInterval(function() {
  try {
    ChannelsQueue.update({ $and: [{ $where: "this.currentTime < this.endTime" }, { videoState: { $eq: "playing" }}]}, { $inc: { currentTime: 1  }});
  }
  catch(e) {
    console.log("Could not update video time!");
  }
  //remove this if I want to try and make more efficient
}, 1000);
