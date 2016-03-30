Router.configure({
  //Template with the name not found, for when the page is not found
  notFoundTemplate: 'notFound',

  //template with name loading, for when the page is loading
  loadingTemplate: 'loading',

  //template for general layout of app
  layoutTemplate: 'layout'
});


Router.route('/', {
  layout: 'layout',
  template: "homepage",
  waitOn: function() {
    Meteor.subscribe('top10Channels', this.params.channelURL);
  }
});

Router.route('/login', function() {
  this.render('loginForm');
});

Router.route('/signup', function() {
  this.render('signUp');
});

Router.route('/list/channels', function() {
  this.render('channelbrowser');
});

Router.route('/logout', function() {
  this.render('logout');
});

Router.route('/mychannels', {
  layout: 'layout',
  template: "myChannels",
  waitOn: function() {
    Meteor.subscribe('myChannels');
  }
});

Router.route('/c/:channelURL', {
  layout: 'layout',
  template: "channelPage",
  data: function() {
    var templateData = {
      channelURL: this.params.channelURL,
      channel: Channels.findOne({ channelURL: this.params.channelURL })
    };
    Session.set("currentChannel",this.params.channelURL);
    return templateData;
  },
  waitOn : function() {
    Meteor.subscribe('getCurrentChannelData', this.params.channelURL);
    Meteor.subscribe('getCurrentChannelsChat', this.params.channelURL);
    Meteor.subscribe('getCurrentChannelViewerList', this.params.channelURL);
    Meteor.subscribe('getCurrentChannelsModList', this.params.channelURL);
    Meteor.subscribe('getCurrentChannelQueue', this.params.channelURL);


    Meteor.call('insertUserIntoViewerList', this.params.channelURL, function(err) {
      if (err) {
        console.log("Unable to insert user into list!");
      }
      else {
        console.log("Successfully inserted user into viewer list!");
      }
    });
  },
  unload: function() {
    Session.set("currentChannel",null);
    Meteor.call('removeUserFromViewerList', this.params.channelURL, Meteor.user().username, function(err) {
      if (err) {
        console.log("Unable to removed user into list!");
      }
      else {
        console.log("Successfully removed user into viewer list!");
      }
    });
  },
  onBeforeAction: function() {
    var self = this.next;
    Meteor.call('getChannelPassword', this.params.channelURL, function(error,result) {
      if (error || !result) {
        console.log("Unable to find channel object!");
      }
      else {
        if (!result["channelPassword"]) {
          self();
        }
        else {
          var d = prompt("Enter the channel password: ");
          if (d === result["channelPassword"]) {
            self();
          }
          else {
            alert("Password invalid!");
            Router.go("/");
          }
        }
      }
    });
  }
});

Router.route('/c/:channelURL/edit', {
  layout: 'layout',
  template: "editChannelPage",
  data: function() {
    templateData = {
      channelURL: this.params.channelURL,
      channel: Channels.findOne({ channelURL: this.params.channelURL })
    };
    return templateData;
  },
  waitOn: function() {
    Meteor.subscribe('getCurrentChannelData', this.params.channelURL);
  }
});
