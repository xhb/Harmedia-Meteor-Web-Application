Template.channelViewerList.helpers({
  getViewerList: function() {
    return ChannelsViewerList.find({});
  },
  userIsMod: function(name) {
    var channelObj = Channels.findOne({});
    var url = channelObj["channelURL"];
    var userInList = ChannelsModList.findOne({ roomURLHandler: url, user: name });
    if (userInList) {
      return "channel-mod";
    }
  },
  userIsOwner: function(name) {
    var channelObj = Channels.findOne({});
    if (name === channelObj["ownerName"]) {
      return "channel-owner";
    }
  },
  userIsGuru: function(name) {
    var channelObj = Channels.findOne({});
    if (name === channelObj["channelGuru"]) {
      return "channel-guru"; 
    }
  },
  isMe: (user) => {
    return (user === Meteor.user().username) ? "channel-me" : "";
  }
});
