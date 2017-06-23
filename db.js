const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  const UserSchema = mongoose.Schema({
    email: {
      type: String,
      index: true,
      unique: true
    },
    accessToken: String,
    accountAddr: String,
    contractAddr: String
  });

  const EmailSchema = mongoose.Schema({
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

  const User = mongoose.Model('User', UserSchema);
  const Email = mongoose.Model('Email', EmailSchema);
});


module.exports = {
  createOrUpdateUser(email, value) {
    return User.update({ email }, value, {
      upsert: true,
    });
  },

  updateUser(email, values, callback) {
    callback = callback || (err, user) => console.log(err, user);
    this.getUserByEmail(email, (err, user) => {
      if(err) {
        callback(err);
      } else if(!user) {
        callback(new Error('No user found with the given email '));
      } else {
        User.update({ email }, values, callback);
      }
    });
  },

  getUserByEmail(email) {
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

  createEmail(receiver, sender, messageId) {
    this.getUserByEmail(receiver, (err, receiver) => {
      Email({
        userId: receiver._id,
        sender: sender,
        messageId: messageId
      }).save();
    });
  },

  onBidEmail(emailId, bid, expiry) {
    Email.findById(emailId, (err, email) => {
      email.bid = bid;
      email.expiry = expiry;
      email.status = 'BID';
      email.save();
    });
  },

  onEmailReplied(emailId) {
    Email.findById(emailId, (err, email) => {
      email.status = 'REPLIED';
      email.save();
    });
  }
};
