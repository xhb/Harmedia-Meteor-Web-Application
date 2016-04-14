Channels = new Mongo.Collection('channels');
ChannelsChat = new Mongo.Collection('channelsChat');
ChannelsViewerList = new Mongo.Collection('channelViewerList');
ChannelsModList = new Mongo.Collection('channelMods');
ChannelsQueue = new Mongo.Collection('channelQueue');
BannedAndSilenceList = new Mongo.Collection('bannedAndSilencedList'); //for users who have been banned or silenced
ChannelEmotes = new Mongo.Collection('channelEmotes');

if (Meteor.isServer) {
    Channels._ensureIndex('channelURL', {unique: 1});
}
