Template.emoticonsEditor.helpers({
  emoticonRow: function() {
    return ChannelEmotes.find({}); //grabbing list of emoticons
  }
});

Template.emoticonsEditor.events({
  'click #deleteEmoticonButton': function(e) {
    e.preventDefault(); //maybe remove this
    var toDelete = confirm("Are you sure you want to delete this emoticon?");
    if (toDelete === true) {
      Meteor.call('deleteEmoticon', this._id, function(error,result) {
        if (error || !result) {
          console.log("Unable to delete!");
        }
        else {
          console.log("Successfully deleted emoticon");
        }
      });
    }
    else {
      console.log("Not deleting your emoticon!");
    }
  },
  'submit #createEmoticon': function(e,t) {
    //look at this logic
    e.preventDefault();
    //triming them
    var url = t.find("#inputImageURL").value.trim();
    var text = t.find("#inputImageText").value.trim();

    if (invalidText(text)) {
      alert("Invalid text field.  Tip: Don't put spaces, be sure text is unique, and less than 10");
      console.log("Invalid text field.  Tip: Don't put spaces, be sure text is unique, and less than 10");
      return;
    }
    else if (invalidURL(url)) {
      alert("URL is too long! (255 char max)");
      console.log("URL is too long! (255 char max)");
      return;
    }
    //if text contains spaces
    //no verification for now
    var channelObj = Channels.findOne({});
    var roomURL = channelObj["channelURL"];
    //console.log(roomURL);

    //make sure unique text
    //make sure make sure text has is 10 or fewer and has no spaces

    Meteor.call('createEmoticon', roomURL, text, url, text, function(error,result) {
      if (error || !result) {
        console.log("Emoticon not added");
      }
      else {
        console.log("Emoticon added!");
      }
    });
    t.find("#inputImageURL").value = "";
    t.find("#inputImageText").value = "";
  }
});

function invalidText(t) {
  var channelObj = Channels.findOne({ eText: t });
  return t.indexOf(' ') >= 0 || t.length >= 10 || channelObj;
}

function invalidURL(t) {
  t.length >= 255;
}
