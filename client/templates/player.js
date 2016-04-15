Template.player.helpers({
  getCurrentChannelObject: function() {
    try {
      return ChannelsQueue.findOne({});
    }
    catch(e) {
      //return "No video playing!";
      return 0;
    }
  },
  getCurrentChannelTime: function() {
    try {
      return ChannelsQueue.findOne({})["currentTime"];
    }
    catch(e) {
      //return "No video playing!";
      return 0;
    }
  },
  getEndChannelTime: function() {
    try {
      return ChannelsQueue.findOne({})["endTime"];
    }
    catch(e) {
      //return "No video playing!";
      return 0;
    }
  },
  formatCurrentTime: function(time) {
    try {
      //return moment().seconds(time).duration('mm:ss');
      return secondsToHoursMin(time);
    }
    catch(e) {
      return 0;
    }
  },
  isGuru: function() {
    try {
      return Channels.findOne()["channelGuru"] === Meteor.user().username;
    }
    catch(e) {
      return false;
    }
  },
  isVideoPaused: function() {
    try {
      return ChannelsQueue.findOne({})["videoState"] === "paused";
    }
    catch(e) {
      console.log("No video playing");
      return false;
    }
  },
  canSkip: function() {
    return true;
  },
  isNoVideoDisableButton: function() {
    //console.log("Nice bro!");
    //Session.get('update');
    var q = ChannelsQueue.findOne({});
    if (q) {
      return false;
    }
    else {
      return true;
    }
  }
});

Template.player.events({
    'click #skip-button': function(e) {
    e.preventDefault();
    //var URL = Router.current().request.url.split("/")[4];
    var channelObject = Channels.findOne({});
    var URL = channelObject["channelURL"];
    console.log(URL);
    Meteor.call('removeVideoFromTopOfQueue',URL, function(error,result) {
      if (error || !result) {
        console.log("Video was not found in queue!");
      }
      else {
        console.log("Removed " + result["videoTitle"] + " from the queue!");
      }
    });
  },
  'click #play-pause-button': function(e) { //may want to handle how I know when to play and pause rather than checking classes
    e.preventDefault();
    var channelObject = Channels.findOne({});
    var URL = channelObject["channelURL"];
    var spanElement = document.getElementById('togglePlause');
    //console.log(spanElement);
    if (spanElement.className === "glyphicon glyphicon-play") {
      spanElement.className = "glyphicon glyphicon-pause";
      //start video (unpause youtube video)
      Meteor.call("updateVideoState", URL, "playing", function(error,result) {
        if (error || !result) {
          console.log("Unable to update video state!");
        }
        else {
          console.log("Updated video state playing!");
        }
      });
    }
    else if(spanElement.className === "glyphicon glyphicon-pause") {
      spanElement.className = "glyphicon glyphicon-play";
      //pause video (pause all clients videos too)
      Meteor.call("updateVideoState", URL, "paused", function(error,result) {
        if (error || !result) {
          console.log("Unable to update video state!");
        }
        else {
          console.log("Updated video state to paused!");
        }
      });
    }
    else {
      console.log("This button is kind of messed up!");
    }
  },
  //maybe can remove the e (event)
  'change #seek-bar': function(e,t) {
    //console.log(e.target);
    //return;
    //console.log(e.target);
    var channelObject = Channels.findOne({});
    var url = channelObject["channelURL"];
    //console.log(url);
    var changeTimeTo = parseInt($('input[id=seek-bar]').val());
    Meteor.call('updateTimeSeek', url, changeTimeTo, function(error, result) {
      if (error || !result) {
        console.log("Could not update the video's current time!");
      }
      else {
        console.log("Starting the video at time " + changeTimeTo + "!");
      }
    });
  },
  'change #volume-bar': function() {
    var volumeChangeTo = parseInt($('input[id=volume-bar]').val());
    console.log("Volume changed to " + volumeChangeTo + "!");
    Template.video.__helpers.get('getPlayerObject')().setVolume(volumeChangeTo);
  }
});

//pulled from http://stackoverflow.com/questions/31337370/how-to-convert-seconds-to-hhmmss-in-moment-js (pad and secondsToHoursMin)
//Should probably think of a better way to structure this
function pad(num) {
    return ("0"+num).slice(-2);
}
function secondsToHoursMin(secs) {
  var minutes = Math.floor(secs / 60);
  secs = secs%60;
  var hours = Math.floor(minutes/60)
  minutes = minutes%60;
  return pad(hours)+":"+pad(minutes)+":"+pad(secs);
}
