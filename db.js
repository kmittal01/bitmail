const config = require('./config');

const mongoose = require('mongoose');

mongoose.connect(config.DB_URL);

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  console.log('Connection Opened');
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    index: true,
    unique: true
  },
  accessToken: String,
  accountAddr: String,
  contractAddr: String,
  historyId: String
});

const EmailSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  messageId: String,
  receiver: String,
  bid: Number,
  expiry: Number,
  status: {
    type: 'String',
    enum : ['BLOCKED', 'BID', 'REPLIED'],
    default: 'BLOCKED',
  }
});

const User = mongoose.model('User', UserSchema);
const Email = mongoose.model('Email', EmailSchema);


module.exports = {

  getConnection() {
    return mongoose.connection;
  },
  
  createOrUpdateUser(email, value, callback = null) {
    User.updateOne({ email }, value, {
      upsert: true,
    }, (err, res) => {
      if (err) {
        callback(err);
      } else if (res.matchedCount === 0) {
        callback(new Error('No user found with the given email '));
      }
      else {
        return this.getUserByEmail(email, callback);
      }
    });
  },

  updateUser(email, values, callback) {
    callback = callback || function(err, user){ console.log(err) };
    User.updateOne({ email }, values, (err, res) => {
      if (err) {
        callback(err);
      } else if (res.matchedCount === 0) {
        callback(new Error('No user found with the given email '));
      }
      else {
        return this.getUserByEmail(email, callback);
      }
    });
  },

  getUserByEmail(email, callback) {
    User.findOne({ email }, (err, user) => {
      if(err) {
        callback(err);
      } else if(!user) {
        callback(new Error('No user found with the given email '));
      } else {
        callback(null, user);
      }
    });
  },

  getEmailById(emailId, callback) {
    Email.findById(emailId, (err, email) => {
      if(err) {
        callback(err);
      } else if(!email) {
        callback(new Error('No email found in the db for give messageId'));
      } else {
        callback(null, email);
      }
    });
  },

  getEmailByQuery(query, callback) {
    Email.findOne(query, (err, email) => {
      if(err) {
        callback(err);
      } else if(!email) {
        callback(new Error('No email found in the db for give messageId'));
      } else {
        callback(null, email);
      }
    });
  }

  getUserById(userId, callback) {
    User.findById(userId, callback);
  },

  createEmail(receiver, messageId) {
    this.getUserByEmail(receiver.email, (err, receiver) => {
      Email({
        userId: receiver._id,
        messageId: messageId
      }).save();
    });
  },

  onBidEmail(messageId, bid) {
    Email.findOne({ messageId }, (err, email) => {
      email.bid = bid;
      email.status = 'BID';
      email.save();
    });
  },

  onEmailReplied(messageId) {
    Email.findOne({ messageId }, (err, email) => {
      email.status = 'REPLIED';
      email.save();
    });
  }
};
