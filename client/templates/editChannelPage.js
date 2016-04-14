Session.set('isInvalidChannelInput',null); //maybe remove
Template.editChannelPage.events({
  'submit #channelUpdateForm': function(e,t) {
    e.preventDefault();
    //var gettingPath = Iron.Location.get().path;
    //var pathSplit = gettingPath.split("/");
    //var urlHandler = pathSplit[2].trim();
    var urlHandler = Channels.findOne({})["channelURL"]; //getting channel url
    var topic = t.find('#inputTopic').value.trim();
    var password = t.find('#inputPassword').value.trim();
    //var tags = t.find("#inputTags").value.trim();

    var tags = Template.taggle.__helpers.get('getAllTags')();
    //console.log(tags);
    //var tags = "";
    if (isValidLength(topic, 5, 32) && isValidLength(password,0,16) && checkTagLength(tags,10)) {
      Session.set('isInvalidChannelInput',null);
      doUpdate(t,urlHandler,topic,password,tags);
    }
    else {
      Session.set('isInvalidChannelInput',true);
    }
  }
});


function doUpdate(t,urlHandler,topic,password,tags) {
  Meteor.call('updateChannel',urlHandler,topic,password,tags, function(err) {
    if (err) {
      Session.set('isInvalidChannelInput',true);
    }
    else {
      Session.set('isInvalidChannelInput',null);
      //t.find('#inputTopic').value = "";
      //t.find('#inputPassword').value = "";
      //t.find('#taggle-tags').value = "";

      console.log("Success!");
      //Router.go('/mychannels');
      alert("Updated successfully!");
      //Router.go('/c/' + urlHandler + '/edit');
    }
  });
}

Template.editChannelPage.helpers({
  isInvalidChannelInput: function() {
    return Session.get('isInvalidChannelInput');
  },
  destroyed: function() {
    Session.set('isInvalidChannelInput',null);
  }
});


function isValidLength(val,small,big) {
  return val.length >= small && val.length <= big;
}

function checkTagLength(t,l) {
  //the length of array t has to be greater than 0 or less than l
  return t.length < l;
}
