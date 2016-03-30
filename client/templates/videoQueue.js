Template.videoQueue.helpers({
  getVideoQueue: function() {
    return ChannelsQueue.find({});
  },
  checkIndex: function(index) {
    if (index === 0) {
      return "success";
    }
  }
});

Template.videoQueue.events({
  'submit .queueForm': function(e,t) {
    e.preventDefault();
    if (Meteor.user()) {
        var channelObj = Channels.findOne({});
        var inputString = t.find("#queueInput").value;
        var youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
        var vimeoRegex = "";
        var mp4Regex = "";
        if (inputString.match(youtubeRegex))  {
          var checkYoutubeInput = inputString.match(youtubeRegex);
          YoutubeAddVideoToQueue(channelObj["channelURL"],checkYoutubeInput[2],"youtube");
        }
        else {
          console.log("What the hell are you trying to do?");
        }
    }
    else {
      console.log("You are not signed in.  Nice try though!");
    }
    t.find("#queueInput").value = "";
  }
});

/*
#################################################################################################################################################################
*/

function YoutubeAddVideoToQueue(url,videoId,type) {
  var apiKey = "AIzaSyCCrnW8idRYwwiioPQ4uxt6Qi0wJSWFLAA";
  $.getJSON('https://www.googleapis.com/youtube/v3/videos?id='+ videoId +'&key=' + apiKey + '&part=snippet&callback=?',function(data){
    if (typeof(data.items[0]) != "undefined") {
      //could grab more
        var title = data.items[0].snippet.title;
        $.getJSON('https://www.googleapis.com/youtube/v3/videos?id='+ videoId +'&part=contentDetails&key=' + apiKey,function(data){
          if (typeof(data.items[0]) != "undefined") {
            var duration = data.items[0].contentDetails.duration;
            duration = duration.replace("PT","")
            console.log(duration);
            duration = computeSeconds(duration);
            Meteor.call('addVideoToQueue', url, type, videoId, title, duration, function(error,result) {
              if (error || !result) {
                console.log("We were unable to add video to queue!");
              }
              else {
                console.log("Added video object to queue: " + title + "!");
              }
            });
          }
          else {
            alert('Video does not exist!');
          }
        });
    }
    else {
      alert('Video does not exist!');
    }
  });
}

function computeSeconds(timeString) {
    var hour = 3600;
    var minute = 60;
    var second = 1;
    var sum = 0;
    var str = "";
    for (var c = 0; c < timeString.length; c++) {
        var character = timeString.charAt(c);
        switch(character) {
            case 'H':
                sum += str * hour;
                str = "";
                break;
            case 'M':
                sum += str * minute;
                str = "";
                break;
            case 'S':
                sum += str * second;
                str = "";
                break;
            default:
                var isNum = /^\d+$/.test(character);
                if (isNum) {
                    str += character;
                }
                else {
                    console.log("Were were unable to parse time!");
                    return null;
                }
                break;
        }
    }
    return sum;
}
