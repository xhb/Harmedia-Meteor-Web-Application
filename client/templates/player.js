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
  formatCurrentTime: function(time) {
    try {
      //return moment().seconds(time).duration('mm:ss');
      return secondsToHoursMin(time);
    }
    catch(e) {
      return 0;
    }
  }
});

Template.player.events({
  'click #skip-button': function(e) {
    e.preventDefault();
    var URL = Router.current().request.url.split("/")[4];
    Meteor.call('removeVideoFromTopOfQueue',URL, function(error,result) {
      if (error || !result) {
        console.log("Video was not found in queue!");
      }
      else {
        console.log("Removed " + result["videoTitle"] + " from the queue!");
      }
    });
  },
  'click #play-pause-button': function(e) {
    e.preventDefault();

    var spanElement = document.getElementById('togglePlause');
    if (spanElement.className === "glyphicon glyphicon glyphicon-play") {
      spanElement.className = "glyphicon glyphicon glyphicon-pause";
    }
    else if(spanElement.className === "glyphicon glyphicon glyphicon-pause") {
      spanElement.className = "glyphicon glyphicon glyphicon-play";
    }
    else {
      console.log("This button is kind of messed up!");
    }
  }
});

  //pulled from http://stackoverflow.com/questions/31337370/how-to-convert-seconds-to-hhmmss-in-moment-js (pad and secondsToHoursMin)
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
