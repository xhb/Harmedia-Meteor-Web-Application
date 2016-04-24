var videoSessionList = {};
Template.channelBrowser.helpers({
  getFilteredChannels: function() {
    //return Channels.find({});
    try {
      var searchObject = Session.get("filterBy");
      var searchBy = searchObject["sb"].trim();
      var searchInput = searchObject["si"];
      if (searchBy === "Owner") {
        return Channels.find({ ownerName: searchInput });
      }
      else if (searchBy === "Tags") {
        var tagArray = searchInput.split(",");
        tagArray.map(function(ind) {
          ind.trim();
        });
        return Channels.find({ channelTags: { $in: tagArray } });
      }
      else if (searchBy === "Topic") {
        //console.log("Topic!");
        return Channels.find({ channelTopic: new RegExp(searchInput) }); //using regex to search
      }
      else {
        console.log("Selection is messed up!");
      }
    }
    catch(e) {
      console.log("No channels to filter through. So displaying all channels!");
      return Channels.find({});
    }
    //return;
  },
  incCount: (count) => {
    return count+1;
  },
  getCurrentVideo: function(url) {
    return Meteor.call("getCurrentVideoForURL", url, function(error,result) {
      if (error || !result) {
        console.log("Unable to retrieve video");
        Session.set("currentVideo", result);
        videoSessionList[url] = Session.get("currentVideo");
      }
      else {
        console.log("Successfully obtained current video!");
        Session.set("currentVideo", result);
        videoSessionList[url] = Session.get("currentVideo");
      }
    });
  },
  getCurrentVideoSession: function(url) {
    return videoSessionList[url];
  }
});

Template.channelBrowser.events({
  'change #searchBy': function(e,t) {
    e.preventDefault();
    var searchBy = t.find("#searchBy").value;
    var searchInput = t.find("#searchInput").value;
    Session.set("filterBy", { sb: searchBy, si: searchInput });
    //t.find("#searchInput").value = "";
  },
  'keyup #searchInput': function(e,t) {
    var searchBy = t.find("#searchBy").value;
    var searchInput = t.find("#searchInput").value;
    Session.set("filterBy", { sb: searchBy, si: searchInput });
    //t.find("#searchInput").value = "";
  }
});
