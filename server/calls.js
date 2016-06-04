//Use Meteor.call() on the client to call these methods
Meteor.methods({
  
  // Used when creating channels
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
  // Used for insert messages into the chat
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
  //Used to get the channel viewer count
  getChannelCount: function() {
    var userId = Meteor.userId();
    var count = Channels.find({ ownerID: userId }).count();
    return count;
  },
  // Used to check if channel count is less than some number
  isHaveLessChannels: function(num) {
    return Meteor.call('getChannelCount') < num;
  },
  // Called when wanting to delete a user channel.  This removes all data that needs to be removed when a channel is deleted
  deleteUserChannel: function(cID) {
    var cURL = Channels.findOne({_id: cID});
    Channels.remove({ _id: cID });
    //console.log(cURL.channelURL);
    ChannelsChat.remove({ roomURLHandler : cURL.channelURL });
    ChannelsViewerList.remove({ roomURLHandler: cURL.channelURL });
    ChannelsModList.remove({ roomURLHandler: cURL.channelURL });
    ChannelsQueue.remove({ roomURLHandler: cURL.channelURL });
    BannedAndSilenceList.remove({ roomURLHandler: cURL.channel });
    ChannelEmotes.remove({ roomURLHandler: cURL.channel });
  },
  //Called when a user wants to delete their account.  It deletes all channels, emotes, bans, etc of that user
  deleteUserAccount: function(u) {
    var cursor = Channels.find({ ownerName: u });
    cursor.forEach(function(chan) {
      //console.log(chan._id);
      ChannelsQueue.remove({ roomURLHandler: chan.channelURL }); //removing all queues for each of their channels
      ChannelEmotes.remove({ roomURLHandler: chan.channelURL }); //removing all emotes for each of their channels
    });
    Channels.remove({ ownerName: u }); //deleting all this users channels
    ChannelsChat.remove({ senderName: u }); //deleting all this users messages
    ChannelsViewerList.remove({ username: u }); //deleting them from all mod list
    ChannelsModList.remove({ user: u }); //deleting them from all viewer list
    ChannelsQueue.remove({ queuedBy: u }); //delete all things they have queued up (May want to remove)
    BannedAndSilenceList.remove({ username: u }); //removing all channels they are banned from
    Meteor.users.remove({ username: u });//Need to remove from accounts database
  },
  // Called when a user wants to update the collection data of a specific channel by UrlHandler
  updateChannel: function(urlHandler,topic,password,tags) {
    Channels.update({channelURL: urlHandler }, { $set: {
      channelTopic: topic,
      channelPassword: password,
      channelTags: tags,
      updatedAt: new Date()
    }});
  },
  // Called when we want to store a user into the viewer list
  insertUserIntoViewerList: function(urlHandler) {
    try {
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
    }
    catch(e){
      console.log("Unable to add user to viewer list!");
    }
  },
  // Called when we want to remove a user from the viewer list
  removeUserFromViewerList: function(urlHandler, uname) {
    try {
      ChannelsViewerList.remove({ roomURLHandler: urlHandler,username: uname });
      var vCount = ChannelsViewerList.find({ roomURLHandler: urlHandler }).count();
      Channels.update({ channelURL: urlHandler }, { $set: { viewerCount: vCount }});
    }
    catch(e) {
      console.log("Unable to remove user from viewerlist");
    }
  },
  // Called when we want to remove a user from all the viewer list
  removeUserFromAllViewerList: function(uname) {
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
  },
  // Called when we want to get the password of a channel
  getChannelPassword: function(url) {
    var obj = Channels.findOne({ channelURL: url });
    return obj;
  },
  // Called to find a user by their username
  findUser: function(userToFind) {
    return Meteor.users.findOne({ username: userToFind });
  },
  // Called to add a user as a mod to a given channel
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
  // Called to remove a user from mod of a channel
  removeModToChannel: function(url, userToUnMod) {
    ChannelsModList.remove({ roomURLHandler: url, user: userToUnMod });
    return true;
  },
  // Called to add a user as a guru of a channel
  addGuruToChannel: function(url, userToGuru) {
    Channels.update({ channelURL: url }, { $set: { channelGuru: userToGuru }});
    return true;
  },
  // Called to remove a user as a guru of a channel
  removeGuruToChannel: function(url, userToUnguru) {
    Channels.update({ channelURL: url }, { $set: { channelGuru: "" }});
    return true;
  },
  // Called to remove all chat messages from a channel (Owners typing /clear )
  removeMessagesFromChat: function(url) {
    ChannelsChat.remove({ roomURLHandler: url });
    return true;
  },
  // Called to add a video to the queue (if queue is empty then add a playing video, else set video state to null)
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
  // Called to remove a video from teh queue
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
  // Called to ge the current video playing
  getCurrentVideoForURL(url) {
    try {
      return ChannelsQueue.findOne({ roomURLHandler: url })["videoTitle"];
    }
    catch(e) {
      return null;
    }
  },
  // Called to update the video time for a given URL
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
  // Called to update the video state
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
  // Called to a add a user to being banned or silenced
  addUserBannedOrSilenced: function(url,name,eTime,a) {
    try {
      //find if user already inserted
      var checkIfAlreadyHere = BannedAndSilenceList.findOne({ roomURLHandler: url, username: name, action: a });
      //console.log(checkIfAlreadyHere);
      if (!checkIfAlreadyHere) {
        //check if it already exist
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
  // Called to remove a user from being banned or silenced
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
  // Check if a user is banned or silenced and if they are not remove the user, else they are return either the time left or permabanned
  isUserBannedOrSilenced: function(url,name,a) {
    var info = BannedAndSilenceList.findOne({ roomURLHandler : url, username: name, action: a });
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
            return eDate;
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
  // Called to check if the user is silenced or not
  isSilenced: function(url,name,a) {
    return BannedAndSilenceList.findOne({ roomURLHandler : url, username: name, action: a });
  },
  // Called to add emoticons to the channel
  createEmoticon: function(roomURL, text, u, a) {
    //creating emoticons
    try {
      ChannelEmotes.insert({
        roomURLHandler: roomURL,
        eText: text,
        url: u,
        alt: a, //just in case we wanna do alt different
        uploader: Meteor.user().username //who uploaded it username
      });
      return true;
    }
    catch(e) {
      return false;
    }
  },
  // Called to delete an emoticon from a channel
  deleteEmoticon: function(e_this) {
    //deleting emoticons
    try {
      ChannelEmotes.remove({ _id: e_this });
    }
    catch(e) {
      return false;
    }
  }
});
