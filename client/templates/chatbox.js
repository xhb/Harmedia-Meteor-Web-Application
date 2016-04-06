Template.chatbox.helpers({
    chatMessage: function() {
      return ChannelsChat.find({});
    },
    formatTimeStamp: function(time) {
      return moment(time).format('hh:mm');
    }
});

Template.chatbox.events({
  //could probably optmize
  'submit .chatfield': function(e,t) {
    e.preventDefault();
    //var urlHandler = Session.get("currentChannel");
    var message = t.find("#channelMessage").value;
    var channelObj = Channels.findOne({});
    var ownerID = channelObj["ownerID"];
    var isUserMod = ChannelsModList.findOne({ roomURLHandler: channelObj["channelURL"], user: Meteor.user().username });
    if (message[0] === "/" && ownerID === Meteor.userId()) {
      var splitMessage = message.split(" ");
      if (splitMessage[0] === "/mod" && splitMessage.length === 2) {
        var toModUser = splitMessage[1];
        if (toModUser === Meteor.user().username) {
          console.log("You cannot mod yourself silly!");
          t.find("#channelMessage").value = "";
          return;
        }
        Meteor.call("findUser", toModUser, function(error,result) {
          if (error || !result) {
            console.log("User was not found!");
          }
          else {
            Meteor.call('addModToChannel', channelObj["channelURL"], toModUser, function(error,result) {
              if (error || !result) {
                console.log("Was not able to mod user.  Maybe they were already modded!");
              }
              else {
                console.log("We just modded " + toModUser + " in channel " + channelObj["channelURL"] + "!");
              }
            });
          }
        });
        t.find("#channelMessage").value = "";
      } //end of mod case
      else if (splitMessage[0] === "/unmod" && splitMessage.length === 2) {
        var toUnModUser = splitMessage[1];
        if (toUnModUser === Meteor.user().username) {
          console.log("You cannot unmod yourself silly!");
          t.find("#channelMessage").value = "";
          return;
        }
        Meteor.call('removeModToChannel', channelObj["channelURL"], toUnModUser, function(error,result) {
          if (error || !result) {
            console.log("Was not able to unmod user.  Maybe they were already unmodded!");
          }
          else {
            console.log("We just unmodded " + toUnModUser + " in channel " + channelObj["channelURL"] + "!");
          }
        });
        t.find("#channelMessage").value = "";
      } //end of unmod case
      else if (splitMessage[0] === "/guru" && splitMessage.length === 2) {
        console.log("Yes");
        var toGuruUser = splitMessage[1];
        Meteor.call("findUser", toGuruUser, function(error,result) {
          if (error || !result) {
            console.log("User was not found!");
          }
          else {
            Meteor.call('addGuruToChannel', channelObj["channelURL"], toGuruUser, function(error,result) {
              if (error || !result) {
                console.log("Was not able to guru user.  Maybe they were already gurued!");
              }
              else {
                console.log("We just gurued " + toGuruUser + " in channel " + channelObj["channelURL"] + "!");
              }
            });
          }
        });
      }// end of owner guru setting
      else if (splitMessage[0] === "/unguru" && splitMessage.length === 2) {
        var toUnguruUser = splitMessage[1];
        Meteor.call('removeGuruToChannel', channelObj["channelURL"], toUnguruUser, function(error,result) {
          if (error || !result) {
            console.log("Was not able to unguru user.  Maybe they were already ungurued!");
          }
          else {
            console.log("We just ungurued " + toUnguruUser + " in channel " + channelObj["channelURL"] + "!");
          }
        });
      }
      else if (splitMessage[0] === "/clear" && splitMessage.length === 1) {
        console.log("Attempting to clear chat!");
        Meteor.call("removeMessagesFromChat", channelObj["channelURL"], function(error, result) {
          if (error || !result) {
            console.log("Unable to clear chat!");
          }
          else {
            console.log("Successfully cleared chat!");
          }
        });
      } //clear chat owner (should only let owner clear chat as of now)
      else {
        console.log("You used the wrong command!");
        t.find("#channelMessage").value = "";
        return;
      } //end of used the wrong command for owner
      t.find("#channelMessage").value = "";
    } //end of '/' and if they are owner case to check for commands
    else if (message[0] === "/" && isUserMod) {
      var splitMessage = message.split(" ");
      if (splitMessage[0] === "/guru" && splitMessage.length === 2) {
        var toGuruUser = splitMessage[1];
        Meteor.call("findUser", toGuruUser, function(error,result) {
          if (error || !result) {
            console.log("User was not found!");
          }
          else {
            //user was found
            Meteor.call('addGuruToChannel', channelObj["channelURL"], toGuruUser, function(error,result) {
              if (error || !result) {
                console.log("Was not able to guru user.  Maybe they were already gurued!");
              }
              else {
                console.log("We just gurued " + toGuruUser + " in channel " + channelObj["channelURL"] + "!");
              }
            });
          }
        });
      }// end of mod guru setting
      else if (splitMessage[0] === "/unguru" && splitMessage.length === 2) {
        var toUnguruUser = splitMessage[1];
        Meteor.call('removeGuruToChannel', channelObj["channelURL"], toUnguruUser, function(error,result) {
          if (error || !result) {
            console.log("Was not able to unguru user.  Maybe they were already ungurued!");
          }
          else {
            console.log("We just ungurued " + toUnguruUser + " in channel " + channelObj["channelURL"] + "!");
          }
        });
      }// end of mod unguru setting
      else {
        console.log("You used the wrong command!");
        t.find("#channelMessage").value = "";
        return;
      }//end of used the wrong command for owner/mod
      t.find("#channelMessage").value = "";
    } // end of '/' and if they are owner/mod case to check for commands
    else if (message[0] === "/") {
      console.log("You used the wrong command or you have no permission to use commands!");
    } //end of random / check to not allow slash messages to show up in chat
    else {
      if (message.length >= 1 && message.length <= 255) {
        Meteor.call('insertMessage', urlHandler, message, function(err) {
          if (err) {
            console.log("An error has occured!");
          }
          else {
            console.log("Success");
          }
          t.find("#channelMessage").value = "";
        });
      }
      else {
        console.log("Error!  May want to dispaly a message!");
      }
    } //end else
    t.find("#channelMessage").value = "";
  } // function end
});
