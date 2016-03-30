Template.createChannelForm.events({
  'submit #channelCreateForm': function(e,t) {
    e.preventDefault();
    var urlHandler = t.find('#channelName').value.replace(/[^a-z0-9]/gi,'').trim();
    var topic = t.find('#channelTopic').value.trim();
    var password = t.find('#channelPassword').value.trim();


    if (isValidLength(urlHandler, 3,12) && isValidLength(topic, 5, 32) && isValidLength(password,0,16)) {
      Session.set('isInvalidChannelInput',null);
      Meteor.call('isHaveLessChannels',3, function(error,result) {
        if (error || !result) {
          Session.set('isInvalidChannelInput',true);

          t.find('#channelName').value = "";
          t.find('#channelTopic').value = "";
          t.find('#channelPassword').value = "";
          console.log("ERROR");
        }
        else {
          console.log("SWEET!");
          doInsert(t,urlHandler,topic,password);
        }
      })
    }
    else {
      Session.set('isInvalidChannelInput',true);
    }
  }
});


Template.createChannelForm.helpers({
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

function doInsert(t,urlHandler,topic,password) {
  Meteor.call('insertChannel',urlHandler,topic,password, function(err) {
    if (err) {
      Session.set('isInvalidChannelInput',true);
    }
    else {
      Session.set('isInvalidChannelInput',null);
      t.find('#channelName').value = "";
      t.find('#channelTopic').value = "";
      t.find('#channelPassword').value = "";
      console.log("Success!");
    }
  });
}
