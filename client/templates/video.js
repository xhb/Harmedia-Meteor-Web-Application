//may be a better way to do this
var ytPlayer;

Template.video.helpers({
  //helpers go here
  checkToPause: function() {
    var channelVideoObject = ChannelsQueue.findOne({});
    if (channelVideoObject["videoState"] === "paused") {
      try {
        ytPlayer.pauseVideo();
      }
      catch(e) {
        console.log("Can't pause video now!");
      }
    }
    else if (channelVideoObject["videoState"] === "playing") {
      try {
        ytPlayer.playVideo();
      }
      catch(e) {
        console.log("Can't play video now!");
      }
    }
    else {
      console.log("Something is messed up!");
    }
  },
  checkSeek: function() {
    var channelVideoObject = ChannelsQueue.findOne({});
    try {
      var clientTime = ytPlayer.getCurrentTime();
    }
    catch(e) {
      console.log("Can't get current time atm!");
    }
    var serverTime = channelVideoObject["currentTime"];

    if (clientTime < serverTime - 5 || clientTime > serverTime + 5) {
      //if user is way out of sync we will resync
      try {
        ytPlayer.seekTo(serverTime,true);
      }
      catch(e) {
        console.log("Can't seek atm!");
      }
      //console.log("OUT OF SYNC!");
    }
  },
});

Template.video.events({
  //events go here
});

Template.video.rendered = function(){
    if (!this.loading) {
      renderYoutubeScript();
    }

};



function renderYoutubeScript() {
  //using adrianliaw:youtube-iframe-api
  var videoPlaying = ChannelsQueue.findOne({});

  onYouTubeIframeAPIReady = function () {
      ytPlayer = new YT.Player("youtube-player", {
          height: "390",
          width: "640",

          videoId: videoPlaying["videoId"],
          events: {
              onReady: function (event) {
                  event.target.playVideo();
                  ytPlayer.seekTo(videoPlaying["currentTime"],true);
              },
          },
          playerVars: {
            'controls': 1,
        }
      });
  };
  YT.load();
}
