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
  return Channels.find({});
});


Meteor.setInterval(function() {
  ChannelsQueue.update({ $and: [{ $where: "this.currentTime < this.endTime" }, { videoState: { $eq: "playing" }}]}, { $inc: { currentTime: 1  }});
  //remove this if I want to try and make more efficient
}, 1000);
