Meteor.methods({
  insertChannel: function(urlHandler,topic,password) {
    var userId = Meteor.userId();
    var username = Meteor.user().username;
    Channels.insert({
      ownerID: userId,
      ownerName: username,
      channelURL: urlHandler,
      channelTopic: topic,
      viewerCount: 0,
      channelPassword: password,
      channelTags: [],
      channelGuru: "",
      createdAt: new Date(),
      updatedAt: new Date()
    });
  },
  insertMessage: function(urlHandler,message) {
    var userId = Meteor.userId();
    var username = Meteor.user().username;
    ChannelsChat.insert({
      senderID: userId,
      senderName: username,
      message: message,
      roomURLHandler: urlHandler,
      timestamp: new Date()
    });
  },
  getChannelCount: function() {
    var userId = Meteor.userId();
    var count = Channels.find({ ownerID: userId }).count();
    return count;
  },
  isHaveLessChannels: function(num) {
    return Meteor.call('getChannelCount') < num;
  },
  deleteUserChannel: function(cID) {
    var cURL = Channels.findOne({_id: cID});
    Channels.remove({ _id: cID });
    //console.log(cURL.channelURL);
    ChannelsChat.remove({ roomURLHandler : cURL.channelURL });
    ChannelsViewerList.remove({ roomURLHandler: cURL.channelURL });
    ChannelsModList.remove({ roomURLHandler: cURL.channelURL });
    ChannelsQueue.remove({ roomURLHandler: cURL.channelURL });
  },
  updateChannel: function(urlHandler,topic,password,tags) {
    Channels.update({channelURL: urlHandler }, { $set: {
      channelTopic: topic,
      channelPassword: password,
      channelTags: tags,
      updatedAt: new Date()
    }});
  },
  insertUserIntoViewerList: function(urlHandler) {
    var isThere = ChannelsViewerList.findOne({ username: Meteor.user().username });
    if (isThere) {
      console.log("User already found in list! Removing user to be readded!");
      ChannelsViewerList.remove({ username: Meteor.user().username });
      Channels.update({ channelURL: urlHandler }, { $inc: { viewerCount: -1 }});
    }
    ChannelsViewerList.insert({
      username: Meteor.user().username,
      roomURLHandler: urlHandler
    });
    var vCount = ChannelsViewerList.find({ roomURLHandler: urlHandler }).count();
    Channels.update({ channelURL: urlHandler }, { $set: { viewerCount: vCount }});
  },
  removeUserFromViewerList: function(urlHandler, uname) {
    ChannelsViewerList.remove({ roomURLHandler: urlHandler,username: uname });
    var vCount = ChannelsViewerList.find({ roomURLHandler: urlHandler }).count();
    Channels.update({ channelURL: urlHandler }, { $set: { viewerCount: vCount }});
  },
  removeUserFromAllViewerList: function(uname) {
    //ChannelsViewerList.remove({ username: uname });
    var urlHandler = ChannelsViewerList.findOne({username: uname})["roomURLHandler"];
    console.log(urlHandler);
    //console.log("Removing user from current channel!");
    Meteor.call('removeUserFromViewerList',urlHandler, uname, function(error) {
      if(error) {
        console.log("Unable to remove user!");
      }
      else {
        console.log("Removed user from channel and updated count!");
      }
    }); //removing viewer from the room he/she is in!
    //Session.set('currentChannel',null); //find better way of doing this
  },
  getChannelPassword: function(url) {
    var obj = Channels.findOne({ channelURL: url });
    return obj;
  },
  findUser: function(userToFind) {
    return Meteor.users.findOne({ username: userToFind });
  },
  addModToChannel: function(url, userToMod) {
    var canMod = ChannelsModList.findOne({ roomURLHandler: url, user: userToMod });
    if (!canMod === false) {
      console.log("Could not mod user because he/she is already modded");
      return false;
    }
    else {
      ChannelsModList.insert({
        roomURLHandler: url,
        user: userToMod
      });
      console.log("Add user to mod list!");
      return true;
    }
  },
  removeModToChannel: function(url, userToUnMod) {
    ChannelsModList.remove({ roomURLHandler: url, user: userToUnMod });
    return true;
  },
  addGuruToChannel: function(url, userToGuru) {
    Channels.update({ channelURL: url }, { $set: { channelGuru: userToGuru }});
    return true;
  },
  removeGuruToChannel: function(url, userToUnguru) {
    Channels.update({ channelURL: url }, { $set: { channelGuru: "" }});
    return true;
  },
  removeMessagesFromChat: function(url) {
    ChannelsChat.remove({ roomURLHandler: url });
    return true;
  },
  addVideoToQueue(url, type, vId, title, duration) {
    var videoQueue = ChannelsQueue.find({ roomURLHandler: url }).count() > 0;
    if (!videoQueue) {
      ChannelsQueue.insert({
        videoType: type,
        videoId: vId,
        roomURLHandler: url,
        videoTitle: title,
        currentTime: 0,
        endTime: duration,
        videoState: "playing",
        queuedBy: Meteor.user().username
      });
      console.log("Queue is empty! Video added with the playing state!");
    }
    else {
      ChannelsQueue.insert({
        videoType: type,
        videoId: vId,
        roomURLHandler: url,
        videoTitle: title,
        currentTime: 0,
        endTime: duration,
        videoState: null,
        queuedBy: Meteor.user().username
      });
      console.log("Video added to queue!");
    }
    return true;
  },
  removeVideoFromTopOfQueue(url) {
    try {
      var videoObject = ChannelsQueue.findOne({ roomURLHandler: url });
      //console.log(videoObject);
      ChannelsQueue.remove({ _id: videoObject["_id"] }); //removing first video in queue
      ChannelsQueue.update({ roomURLHandler: url }, { $set: { videoState: "playing"} }); //getting next video
      console.log("Set next video to playing!");
      return videoObject;
    }
    catch (e) {
      console.log("No video found in queue!");
      return null; //may want to just do false
    }
  },
  getCurrentVideoForURL(url) {
    try {
      return ChannelsQueue.findOne({ roomURLHandler: url })["videoTitle"];
    }
    catch(e) {
      return null;
    }
  },
  updateTimeSeek: function(url, timeInSeconds) {
    try {
      var currentVideoID = ChannelsQueue.findOne({})["_id"];
      //console.log(currentVideoID);
      ChannelsQueue.update({ _id: currentVideoID }, { $set: { currentTime: timeInSeconds } }); //may be inefficient
      return true;
    }
    catch(e) {
      return false;
    }
  },
  updateVideoState: function(url,state) {
    try {
      var currentVideoID = ChannelsQueue.findOne({})["_id"];
      ChannelsQueue.update({ _id: currentVideoID }, { $set: { videoState: state } }); //may be inefficient
      return true;
    }
    catch(e) {
      return false;
    }
  },
  addUserBannedOrSilenced: function(url,name,eTime,a) {
    try {
      //find if user already inserted
      var checkIfAlreadyHere = BannedAndSilenceList.findOne({ roomURLHandler: url, username: name, action: a });
      //console.log(checkIfAlreadyHere);
      if (!checkIfAlreadyHere) {
        //check if it already exist
        //console.log("Using this case!");
        BannedAndSilenceList.insert({
          roomURLHandler: url, //room they are banned in
          username: name, //user who will be banned
          endTime: eTime, //when this will ware off
          action: a //can be ban or silence
        });
      }
      else {
        BannedAndSilenceList.update({ roomURLHandler: url, username: name }, { $set: { endTime: eTime } }); //updating if already here
      }
      return true;
    }
    catch(e) {
      //console.log("Unable to add user to moderated list!");
      return false;
    }
  },
  unBanOrUnsilence: function(url,name,a) {
    try {
      if (a === "silence" || a === "ban") {
        BannedAndSilenceList.remove({ roomURLHandler: url, username: name, action: a }); //unbanning or unsilencing user
        return true;
      }
      else {
        console.log("Wrong action inputted!");
        return false;
      }
    }
    catch(e) {
      //console.log("Unable to unban that user!");
      return false;
    }
  },
  isUserBannedOrSilenced: function(url,name,a) {
    //var info_temp = BannedAndSilenceList.find({ $and: [ {roomURLHandler : url}, {username: name}, {action: a }] }); //getting first item (could remove fetch and indexing)
    var info = BannedAndSilenceList.findOne({ roomURLHandler : url, username: name, action: a });
    //console.log(info);
    //console.log(info.get("_mongo"));
    //console.log(info.count());
    try {
      var eDate = info["endTime"];
      //console.log(eDate);
      if (a === "silence" || a === "ban") {
        if (!info) { //user banned info not found (not going to use .count())
          return false;
        }
        else if (eDate === -1) { //user is permabanned
          return "permabanned"; //should change to true
        }
        else { //user is banned but wanna be sure it hasn't expired
          var currentDate = new Date();
          //console.log(currentDate);
          //console.log(eDate);
          if (eDate <= currentDate) {
            //unban user
            Meteor.call('unBanOrUnsilence', url, name, a, function(error,result) {
              if (error || !result) {
                console.log("Unable to unsilence/ban user even though it expired!");
                return false; //should change back to true
              }
              else {
                console.log("User unsilenced/unbanned since timeout expired!");
                return false;
              }
            });
          }
          else {
            console.log("Has not expired!");
            return eDate; //user timeout has not expired and still banned (Should change back to true)
          }
        }
      }
      else {
        console.log("Wrong action inputed!");
        return false;
      }
    }
    catch(e) {
      console.log("No endtime found!");
      return false;
    }
  },
  isSilenced: function(url,name,a) {
    //maye move up in the above function at some point
    return BannedAndSilenceList.findOne({ roomURLHandler : url, username: name, action: a });
  }
  /*updateChannelCurrentTimes: function() {
    ChannelsQueue.update({ $and: [{ $where: "this.currentTime < this.endTime" }, { videoState: { $eq: "playing" }}]}, { $inc: { currentTime: 1  }});
    return true;
  }*/
});
