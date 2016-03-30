Channels = new Mongo.Collection('channels'); 
ChannelsChat = new Mongo.Collection('channelsChat');
ChannelsViewerList = new Mongo.Collection('channelViewerList');
ChannelsModList = new Mongo.Collection('channelMods');
ChannelsQueue = new Mongo.Collection('channelQueue');

if (Meteor.isServer) {
    Channels._ensureIndex('channelURL', {unique: 1});
}
