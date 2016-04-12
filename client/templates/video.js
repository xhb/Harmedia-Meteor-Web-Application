var ytPlayer;
var previousVideoId;

Template.video.helpers({
  //helpers go here
  checkToPause: function() {
    try {
        var channelVideoObject = ChannelsQueue.findOne({});
        channelVideoObject["videoState"] = channelVideoObject["videoState"];
    }
    catch(e) {
      console.log("Unable to get video state!");
      return;
    }
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
  checkSyncTime: function() {
    //look into this
    var channelVideoObject = ChannelsQueue.findOne({});
    var clientTime;
    try {
      clientTime = ytPlayer.getCurrentTime();
    }
    catch(e) {
      console.log("Can't get current time atm!");
    }
    try {
        var serverTime = channelVideoObject["currentTime"];
    }
    catch(e) {
      console.log("Unable to get current time!");
      return;
    }

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
  //maybe delete this later
  checkForNewVideo: function() {
    try {
      var channelVideoObject = ChannelsQueue.findOne({});
      channelVideoObject["videoId"] = channelVideoObject["videoId"];
    }
    catch (e) {
      console.log("Unable to load videoId");
      return;
    }
    if (channelVideoObject["videoId"] !== previousVideoId) {
      //it has changed
      //ytPlayer.videoId =  channelVideoObject["videoId"];
      //YT.load();
      try {
        ytPlayer.loadVideoById(channelVideoObject["videoId"], 0, "large");
        previousVideoId = channelVideoObject["videoId"];
        //console.log("New video!");
      }
      catch(e) {
        console.log("Video unable to load because null!");
      }
    }
    else if (channelVideoObject["videoId"] === previousVideoId) {
      //console.log("Old video!");
      return;
    }
    else {
      console.log("Something went wrong!");
    }
  },
  getPlayerObject: function() {
    return ytPlayer;
  }
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
  try {
    var videoPlaying = ChannelsQueue.findOne({});
    previousVideoId = videoPlaying['videoId']; //look at this
    onYouTubeIframeAPIReady = function () {
        ytPlayer = new YT.Player("youtube-player", {
            height: "390",
            width: "640",

            videoId: videoPlaying["videoId"],
            events: {
                onReady: function (event) {
                  ytPlayer.setVolume(50); //setting intial vollume to be 50
                  if (videoPlaying['videoState'] === "paused") {
                    //event.target.pauseVideo();
                    try {
                      ytPlayer.seekTo(videoPlaying["currentTime"],true);
                      ytPlayer.pauseVideo();
                    }
                    catch(e) {
                      console.log("Unable to get videos current time!");
                    }
                  }
                  else if (videoPlaying["videoState"] === "playing") {
                    //event.target.playVideo();
                    try {
                      ytPlayer.seekTo(videoPlaying["currentTime"],true);
                      ytPlayer.playVideo();
                    }
                    catch(e) {
                      console.log("Unable to get videos current time!");
                    }
                  }
                  else {
                    console.log("Something is messed up!");
                  }
                },
            },
            playerVars: {
              'controls': 0,
          }
        });
    };
  }
  catch(e) {
    console.log("Unable to get video playing ID");
    onYouTubeIframeAPIReady = function () {
        ytPlayer = new YT.Player("youtube-player", {
            height: "390",
            width: "640",

            videoId: 0,
            events: {
                onReady: function (event) {
                  try {
                    if (videoPlaying['videoState'] === "paused") {
                      try {
                        ytPlayer.seekTo(videoPlaying["currentTime"],true);
                        ytPlayer.pauseVideo();
                      }
                      catch(e) {
                        console.log("Unable to get videos current time!");
                      }
                    }
                    else if (videoPlaying["videoState"] === "playing") {
                      try {
                        ytPlayer.seekTo(videoPlaying["currentTime"],true);
                        ytPlayer.playVideo();
                      }
                      catch(e) {
                        console.log("Unable to get videos current time!");
                      }
                    }
                    else {
                      console.log("Something is messed up!");
                    }
                  }
                  catch(e) {
                    console.log("No video playing!");
                    return;
                  }
                },
            },
            playerVars: {
              'controls': 0,
          }
        });
    };
  }
  YT.load();
}
