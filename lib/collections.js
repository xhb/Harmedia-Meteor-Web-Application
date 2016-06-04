/*
  This file houses all the MongoDB declaration statements
*/

Channels = new Mongo.Collection('channels');
ChannelsChat = new Mongo.Collection('channelsChat');
ChannelsViewerList = new Mongo.Collection('channelViewerList');
ChannelsModList = new Mongo.Collection('channelMods');
ChannelsQueue = new Mongo.Collection('channelQueue');
BannedAndSilenceList = new Mongo.Collection('bannedAndSilencedList');
ChannelEmotes = new Mongo.Collection('channelEmotes');

//Only executes on the server
if (Meteor.isServer) {
    //Setting it so channels must have a unique channelURL
    Channels._ensureIndex('channelURL', {unique: 1});
}
