Template.channelPage.helpers({
  getCSSStyles: function() {
    return Channels.findOne({})["channelStyles"];
    //return "#queueButton { color: green; }";
  }
});
