/*Template.taggle.rendered = function() {
    if(!this._rendered) {
      this._rendered = true;
      var channelObject = Channels.findOne({});
      var channelObjectTags = channelObject["channelTags"] || false;
      if (channelObjectTags) {
        //if object exist
        taggle = new Taggle('taggle-tags', {
            tags: channelObjectTags,
            //placeholder: 'Enter tags:',
        });
      }
      else {
        // Make sure to return true or false in onBeforeTagAdd and onBeforeTagRemove
        taggle = new Taggle('taggle-tags', {
            tags: [],
            //placeholder: 'Enter tags:'
        });
      }
    }
};*/
var taggle;
Template.taggle.rendered=function(){
  renderTaggle();
  //var t = this.view.template.__helpers;
  //var tt =  t[" getAllTags"].call();
};

function renderTaggle() {
  var channelObject = Channels.findOne({});
  var channelObjectTags;
  try {
      channelObjectTags = channelObject["channelTags"];
  }
  catch(e) {
    channelObjectTags = false;
  }
  if (channelObjectTags) {
    //if object exist
    taggle = new Taggle('taggle-tags', {
        tags: channelObjectTags,
        //placeholder: 'Enter tags:',
    });
  }
  else {
    // Make sure to return true or false in onBeforeTagAdd and onBeforeTagRemove
    taggle = new Taggle('taggle-tags', {
        tags: [],
        //placeholder: 'Enter tags:'
    });
  }
}

Template.taggle.helpers({
  getAllTags: function() {
    //console.log(taggle.getTagValues());
    /*try {
      return taggle.getTags();
    }
    catch(e) {
      console.log("Could not get tag elements!");
      return [];
    }*/
    return taggle.getTags()["values"];
  }
});
