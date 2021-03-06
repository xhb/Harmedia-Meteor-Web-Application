/*
  This code needs to be refactored a bit to better deal with increased server load.
*/

Session.set('toScroll',true);

Template.chatbox.helpers({
    scrollDown: function(){
      Session.set('toScroll',true);
    },
    chatMessage: function() {
      return ChannelsChat.find({});
    },
    messageInChat: function(message) {
      return message.split(" ");
    },
    formatTimeStamp: function(time) {
      return moment(time).format('hh:mm');
    },
    doesEmoteExist: function(m) {
      //may be a better way to do it
      //begin adding emoticons here!
      try {
        var e = ChannelEmotes.findOne({ eText: m });
        if (e) {
          return true;
        }
        else {
          return false; //do nothing
        }
      }
      catch(e) {
        return false;
      }
    },
    parseMessageForEmotesUrl: function(m) {
      var e = ChannelEmotes.findOne({ eText: m });
      if (e) {
        return e["url"];
      }
      else {
        return false; //do nothing
      }
    },
    parseMessageForEmotesAlt: function(m) {
      var e = ChannelEmotes.findOne({ eText: m });
      if (e) {
        return e["alt"];
      }
      else {
        return false; //do nothing
      }
    },
    checkIfSilencedOrBanned: function(a) {
      var update = Session.get('update');
      try {
        var url = Channels.findOne({})["channelURL"];
        if (a === 'ban') {
          Meteor.call('isUserBannedOrSilenced', url, Meteor.user().username, a, function(error,result) {
            if (error) {
              console.log("An error has occured!");
            }
            else if (result) { //checking if user is banned
              var currentTime = new Date();
              var tempBannedObject = BannedAndSilenceList.findOne({ roomURLHandler: url, username: Meteor.user().username, action: a });
              var endTime = tempBannedObject["endTime"];
              var time = calculateSecondsBetweenDates(endTime, currentTime);
              Router.go('/');
              alert("You are banned for " + time);
            }
            else {
                console.log("You are not banned!");
              return;
            }
          });
        }
        else if (a === 'silence') {
            Meteor.call('isUserBannedOrSilenced', url, Meteor.user().username, a, function(error,result) {
            if (error) {
              console.log("An error has occured!");
              Session.set("isDisabled",null);
              Session.set("timeBannedUntil", null);
              return;
            }
            else if (result) { //change this back to result === true
              //var tempBannedObject = BannedAndSilenceList.findOne({ roomURLHandler: url, username: Meteor.user().username, action: a });
              console.log("You are silenced bro!");
              Session.set("isDisabled","disabled");
              Session.set("timeBannedUntil", result);
              return true;
            }
            else {
              console.log("You are not silenced!");
              Session.set("isDisabled",null);
              Session.set("timeBannedUntil", null);
              return false;
            }
          });
        }
        else {
          console.log("You set up your action wrong!");
          return;
        }
      }
      catch(e) {
        console.log("You must not be logged in!");
        return;
      }
    },
    shouldDisable: function() {
      return Session.get("isDisabled");
    },
    getSilencedTime: function() {
      Session.get('update');
      var silencedDate = Session.get("timeBannedUntil");
      if (silencedDate === null) {
        return "Send chat message...";
      }
      else if (silencedDate === "permabanned") {
        return "You are permanetly silenced!";
      }
      else {
        var currentTimeDate = new Date();
        return "You are timed out for " + calculateSecondsBetweenDates(silencedDate, currentTimeDate) + " seconds!";
      }
    },
    getTextColor: function(username) {
      var channelObj = Channels.findOne({});
      var roomURL = channelObj["channelURL"];
      var ownerName = channelObj["ownerName"];
      var userLevel = ownerName === username ? "channel-owner": null
                    || ChannelsModList.findOne({ roomURLHandler: roomURL, user: username }) ? "channel-mod": null
                    || username !== undefined ? "channel-user": "";
      return userLevel;
    },
    isGuru: function(username) {
      var channelObj = Channels.findOne({});
      var isGuru = channelObj["channelGuru"] === username ? "channel-guru" : ""; /* Change to channel-guru later */
      return isGuru;
    }
});

Template.chatbox.events({
  //could probably optmize
  'submit .chatfield': function(e,t) {
    e.preventDefault();
    var message = t.find("#channelMessage").value;
    message = message.trim(); //stripping spaces for now
    var channelObj = Channels.findOne({});
    var ownerID = channelObj["ownerID"];
    var isUserMod = ChannelsModList.findOne({ roomURLHandler: channelObj["channelURL"], user: Meteor.user().username });
    if (message[0] === "/" && ownerID === Meteor.userId()) {
      var splitMessage = message.split(" ");
      if (splitMessage[0] === "/mod" && splitMessage.length === 2) {
        var toModUser = splitMessage[1]; //may want to cast all these to lowercase
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
      else if (splitMessage[0] === "/ban" && splitMessage.length === 3) {
        var time = splitMessage[2];
        var user = splitMessage[1];
        /*if (!isNumber(time)) {
          //if its not a number
          console.log("Did not input valid number in param 3!");
        }
        else if (user === Meteor.user().username) {
          console.log("You cannot ban yourself silly!");
        }*/
        if (user === Meteor.user().username) {
          console.log("You cannot ban yourself silly!");
        }
        else if (time < -1 || time > 604800) { //checking bounds (No more than a week of ban)
          alert("Invalid time entered.  Please insert time between -1 and 604800 (1 week) (inclusive)");
        }
        //mods will have a check to ensure they cannot ban other mods
        else {
          Meteor.call("findUser", user, function(error,result) {
            if (error || !result) {
              console.log("User was not found!");
            }
            else {
              /*var timeToBan = new Date();
              console.log(time);
              console.log(timeToBan);*/
              if (time == -1) { //may want to change later
                timeToBan = -1;
                console.log("Permabanning the user!");
              }
              else {
                var timeObject = new Date();
                console.log(timeObject);
                var timeToBan = new Date(timeObject .getTime() + 1000*time);
                console.log(timeToBan);
              }
              Meteor.call('addUserBannedOrSilenced', channelObj["channelURL"], user, timeToBan, "ban", function(error,result) {
                if (error || !result) {
                  console.log("Was not able to ban user!");
                }
                else {
                  console.log("We just banned " + user + " in channel " + channelObj["channelURL"] + " for " + time + " seconds!");
                }
              });
            }
          });
        }
      } //end of ban user for owner
      else if (splitMessage[0] === "/unban" && splitMessage.length === 2) {
        //var time = splitMessage[2];
        var user = splitMessage[1];
        if (user === Meteor.user().username) {
          console.log("You cannot unban yourself silly!");
        }
        else {
          Meteor.call("findUser", user, function(error,result) {
            if (error || !result) {
              console.log("User was not found!");
            }
            else {
              var timeToBan = new Date() + time;
              Meteor.call('unBanOrUnsilence', channelObj["channelURL"], user, "ban", function(error,result) {
                if (error || !result) {
                  console.log("Was not able to unban user!");
                }
                else {
                  console.log("We just unbanned " + user + " in channel " + channelObj["channelURL"] + "!");
                }
              });
            }
          });
        }
      } //end of unban user for owner
      else if (splitMessage[0] === "/silence" && splitMessage.length === 3) {
        var time = splitMessage[2];
        var user = splitMessage[1];
        /*if (!isNumber(time)) {
          //if its not a number
          console.log("Did not input valid number in param 3!");
        }
        else if (user === Meteor.user().username) {
          console.log("You cannot ban yourself silly!");
        }*/
        if (user === Meteor.user().username) {
          console.log("You cannot ban yourself silly!");
        }
        else if (time < 0 || time > 604800) { //checking bounds (No more than a week of ban)
          alert("Invalid time entered.  Please insert time between 1 and 604800 (1 week) (inclusive)");
        }
        //mods will have a check to ensure they cannot ban other mods
        else {
          Meteor.call("findUser", user, function(error,result) {
            if (error || !result) {
              console.log("User was not found!");
            }
            //mods shouldn't be able to silence other mods (This is owner however)
            else {
                var timeObject = new Date();
                console.log(timeObject);
                var timeToBan = new Date(timeObject .getTime() + 1000*time);
                console.log(timeToBan);
              Meteor.call('addUserBannedOrSilenced', channelObj["channelURL"], user, timeToBan, "silence", function(error,result) {
                if (error || !result) {
                  console.log("Was not able to silence user!");
                }
                else {
                  console.log("We just silenced " + user + " in channel " + channelObj["channelURL"] + " for " + time + " seconds!");
                }
              });
            }
          });
        }
      }//end of silence user owner
      else if (splitMessage[0] === "/unsilence" && splitMessage.length === 2) {
        //var time = splitMessage[2];
        var user = splitMessage[1];
        if (user === Meteor.user().username) {
          console.log("You cannot unban yourself silly!");
        }
        else {
          Meteor.call("findUser", user, function(error,result) {
            if (error || !result) {
              console.log("User was not found!");
            }
            else {
              var timeToBan = new Date() + time;
              Meteor.call('unBanOrUnsilence', channelObj["channelURL"], user, "silence", function(error,result) {
                if (error || !result) {
                  console.log("Was not able to unsilence user!");
                }
                else {
                  console.log("We just unsilenced " + user + " in channel " + channelObj["channelURL"] + "!");
                }
              });
            }
          });
        }
      } //end of unsilence user owner
      else {
        console.log("You used the wrong command!");
        t.find("#channelMessage").value = "";
        return;
      } //end of used the wrongparseMessageForEmotes command for owner
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
      else if (splitMessage[0] === "/ban" && splitMessage.length === 3) {
        var time = splitMessage[2];
        var user = splitMessage[1];
        var channelObj = Channels.findOne({});
        var modObj = ChannelsModList.findOne({ user: user });
        if (user === Meteor.user().username) {
          console.log("You cannot ban yourself silly!");
        }
        else if (user === channelObj["ownerName"]) {
          alert("You cannot ban the owner!");
          console.log("You cannot ban the owner of the channel!");
        }
        else if (modObj) {
          alert("You cannot ban other mods!");
          console.log("You cannot ban other mods!");
        }
        else if (time < -1 || time > 604800) { //checking bounds (No more than a week of ban)
          alert("Invalid time entered.  Please insert time between -1 and 604800 (1 week) (inclusive)");
        }
        //mods will have a check to ensure they cannot ban other mods
        else {
          Meteor.call("findUser", user, function(error,result) {
            if (error || !result) {
              console.log("User was not found!");
            }
            else {
              /*var timeToBan = new Date();
              console.log(time);
              console.log(timeToBan);*/
              if (time == -1) { //may want to change later
                timeToBan = -1;
                console.log("Permabanning the user!");
              }
              else {
                var timeObject = new Date();
                console.log(timeObject);
                var timeToBan = new Date(timeObject .getTime() + 1000*time);
                console.log(timeToBan);
              }
              Meteor.call('addUserBannedOrSilenced', channelObj["channelURL"], user, timeToBan, "ban", function(error,result) {
                if (error || !result) {
                  console.log("Was not able to ban user!");
                }
                else {
                  console.log("We just banned " + user + " in channel " + channelObj["channelURL"] + " for " + time + " seconds!");
                }
              });
            }
          });
        }
      } //end of ban user for moderator
      else if (splitMessage[0] === "/unban" && splitMessage.length === 2) {
        //var time = splitMessage[2];
        var user = splitMessage[1];
        /*var channelObj = Channels.findOne({});
        var modObj = ChannelsModList.findOne({ user: user });*/
        if (user === Meteor.user().username) {
          console.log("You cannot unban yourself silly!");
        }
        /*else if (user === channelObj["ownerName"]) {
          alert("You cannot ban the owner!");
          console.log("You cannot unban the owner of the channel!");
        }
        else if (modObj) {
          alert("You cannot ban other mods!");
          console.log("You cannot unban other mods!");
        }*/
        else {
          Meteor.call("findUser", user, function(error,result) {
            if (error || !result) {
              console.log("User was not found!");
            }
            else {
              var timeToBan = new Date() + time;
              Meteor.call('unBanOrUnsilence', channelObj["channelURL"], user, "ban", function(error,result) {
                if (error || !result) {
                  console.log("Was not able to unban user!");
                }
                else {
                  console.log("We just unbanned " + user + " in channel " + channelObj["channelURL"] + "!");
                }
              });
            }
          });
        }
      } //end of unban user for moderator
      else if (splitMessage[0] === "/silence" && splitMessage.length === 3) {
        var time = splitMessage[2];
        var user = splitMessage[1];
        var channelObj = Channels.findOne({});
        var modObj = ChannelsModList.findOne({ user: user });
        if (user === Meteor.user().username) {
          console.log("You cannot silence yourself silly!");
        }
        else if (user === channelObj["ownerName"]) {
          alert("You cannot silence the owner!");
          console.log("You cannot silence the owner of the channel!");
        }
        else if (modObj) {
          alert("You cannot silence other mods!");
          console.log("You cannot silence other mods!");
        }
        else if (time < 0 || time > 604800) { //checking bounds (No more than a week of ban)
          alert("Invalid time entered.  Please insert time between 1 and 604800 (1 week) (inclusive)");
        }
        //mods will have a check to ensure they cannot ban other mods
        else {
          Meteor.call("findUser", user, function(error,result) {
            if (error || !result) {
              console.log("User was not found!");
            }
            //mods shouldn't be able to silence other mods (This is owner however)
            else {
                var timeObject = new Date();
                console.log(timeObject);
                var timeToBan = new Date(timeObject .getTime() + 1000*time);
                console.log(timeToBan);
              Meteor.call('addUserBannedOrSilenced', channelObj["channelURL"], user, timeToBan, "silence", function(error,result) {
                if (error || !result) {
                  console.log("Was not able to silence user!");
                }
                else {
                  console.log("We just silenced " + user + " in channel " + channelObj["channelURL"] + " for " + time + " seconds!");
                }
              });
            }
          });
        }
      }//end of silence user moderator
      else if (splitMessage[0] === "/unsilence" && splitMessage.length === 2) {
        //var time = splitMessage[2];
        var user = splitMessage[1];
        if (user === Meteor.user().username) {
          console.log("You cannot unsilence yourself silly!");
        }
        else {
          Meteor.call("findUser", user, function(error,result) {
            if (error || !result) {
              console.log("User was not found!");
            }
            else {
              var timeToBan = new Date() + time;
              Meteor.call('unBanOrUnsilence', channelObj["channelURL"], user, "silence", function(error,result) {
                if (error || !result) {
                  console.log("Was not able to unsilence user!");
                }
                else {
                  console.log("We just unsilenced " + user + " in channel " + channelObj["channelURL"] + "!");
                }
              });
            }
          });
        }
      } //end of unsilence user moderator
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
        Meteor.call('insertMessage', channelObj["channelURL"], message, function(err) {
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

function calculateSecondsBetweenDates(ds,de) {
  //borrowed logic from: http://stackoverflow.com/questions/2024198/how-many-seconds-between-two-dates
  if (ds === -1) {
    return "You are permanately banned from this channel!";
  }
  else {
    var diff = ds - de;
    var difference_between_two = diff / 1000;
    var result = Math.abs(difference_between_two);
  }
  return result;
}

/* Put here because do not want it to load this script on every  page since it is only used here */
/* Borrowed from here: http://stackoverflow.com/questions/18614301/keep-overflow-div-scrolled-to-bottom-unless-user-scrolls-up */
function updateScroll(toScroll){
  try {
    if (toScroll) {
      var element = document.getElementsByClassName("chatbox")[0];
      //console.log(element);
      element.scrollTop = element.scrollHeight;
      Session.set('toScroll',false);
    }
  }
  catch(e) {
    console.log("Not on the correct page to deal with scroll height!");
  }
}


//so i am constantly checking if banned or silenced
Meteor.setInterval(function() {
  Session.set('update',Math.random());
  //Template.chatbox.__helpers.get('getSilencedTime')();
  updateScroll(Session.get('toScroll'));
},1000); //may not want to use this
