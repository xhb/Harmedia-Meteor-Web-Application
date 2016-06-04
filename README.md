![logo](http://i.imgur.com/WJOOzsF.png)
# Harmedia
_* Note: This project requires you to install Meteor.  One can find meteor at https://www.meteor.com/ *_
## Harmedia is a YouTube video client synchronization web platform.
### Meteor uses the publish susbcribe model to create very reactive web applications.  Some of the key libraries that were used in this web application are as followed:
* [Blaze](http://guide.meteor.com/blaze.html) - Meteors package for reactive templating
* [Iron Router](https://github.com/iron-meteor/iron-router) - Handled webpage routing
* [Sessions](https://docs.meteor.com/api/session.html) - Global reactive object to store key-value pairs (Use reactive package for local reactive storage objects)
* [Bootstrap](http://getbootstrap.com/) - Used for easy frontend development so we could focus on the backend
* [Accounts](https://docs.meteor.com/api/accounts.html) - Meteor's built-in account system that I slightly modified to fit our need

### Basic Features:
- Account System
  - Create
  - Delete
- Channels
  - Create
  - Delete
  - Update
  - Chatting system
  - Tagging
  - Emotes
  - Moderation
  - Guru (person with control of video state) & Synchronization
- Channel Browsing 

### Future Features:
- More user levels (Co-owners, regulars, etc)
- Channel customization
- More optimized chat
- More reliable viewer list updating
- Tweak syncing to better fit all users

### Mod Commands:
    /guru <user> 
    /unguru <user>
    /ban <user> <time> (If time = -1 then a permaban and cannnot ban the owner or other mods)
    /unban <user>
    /silence <user> <time> (Maximum timeout is 1 week on the silence and cannnot ban the owner or other mods)
    /unsilence <user>
    
### Owner Commands:
    /mod <user>
    /unmod <user>
    /clear (Clears the chat)
    /ban <user> <time> (If time = -1 then a permaban)
    /unban <user>
    /silence <user> <time> (Maximum timeout is 1 week on the silence)
    /unsilence <user>

#### To see a working demo video please go here: http://harmedia.github.io/

##### To run this please clone the repository and use the terminal to go into your newly cloned repository and type **_meteor run_** to run the website.  It will generally serve the webpage at the following URL: http://localhost:3000/.
###### Thank you for your time and feel free to report all bugs/issues or feature suggestions onto this Github repository.