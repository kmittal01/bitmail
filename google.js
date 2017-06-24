const express = require('express');
const router = express.Router();
const google = require('googleapis');
const plus = google.plus('v1');
const gmail = google.gmail('v1');
const config = require('./config').GOOGLE;
const OAuth2 = google.auth.OAuth2;

module.exports = {
  getAuthClient: function(accessToken = null, refreshToken = null) {
    const client = new OAuth2(
      config.CLIENT_ID,
      config.CLIENT_SECRET,
      config.OAUTH2_REDIRECT_URL
    );

    if (accessToken) {
      client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
      });
    }
    return client;
  },

  authorize: function() {
    const oauth2Client = this.getAuthClient();
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: config.OAUTH2_SCOPES
    });
  },

  getUser: function(authCode, callback) {
    const oauth2Client = this.getAuthClient();
    oauth2Client.getToken(authCode, function(err, tokens) {
      if (err) {
        console.log('Error', err);
        callback(err);
        return;
      }
      console.log('Fetched Tokens', tokens);
      oauth2Client.setCredentials(tokens);
      plus.people.get({ userId: 'me', auth: oauth2Client }, function(error, user) {
        if (error) {
          callback(error);
          return;
        }
        console.log('User', user);
        callback(null, {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          email: user.emails[0].value
        });
      });
    });
  },

  watchMessage: function(accessToken, refreshToken = null, callback = null){
    const oauth2Client = this.getAuthClient(accessToken, refreshToken);
    var options = {
      userId: 'me',
      auth: oauth2Client,
      resource: {
        topicName: config.GMAIL_PUBSUB_TOPIC
      }
    };

    gmail.users.watch(options, function (err, res) {
      if (callback) {
        callback(err, res);
      } else {
        if (err) {
          console.error('Failed to setup email subscription');
        } else {
          console.log('Successfully registered email subscription');
        }
      }
    });
  },

  handleEmailNotification: function(userEmail, historyId, messageId, accessToken, refreshToken = null) {
    const self = this
    const oauth2Client = this.getAuthClient(accessToken, refreshToken);
    var options = {
      userId: 'me',
      auth: oauth2Client,
      historyTypes: "messageAdded",
      startHistoryId: historyId
    };
    gmail.users.history.list(options, function (err, res) {
      if (err) {
        console.error('Failed To Fetch Gmail History');
      } else {
        console.log(res.history[0]['messages'][0]['id'])
        for (var i=0; i< res.history.length; i++){
          self.modifyLabels(accessToken, ["Label_4"], ["INBOX"], res.history[i]['messages'][0]['id'])
        }
      }
    });
  },
  modifyLabels: function(accessToken, addLabelIds, removeLabelIds, messageId, refreshToken=null){
    const oauth2Client = this.getAuthClient(accessToken, refreshToken);
    var options = {
      userId: 'me',
      id: messageId,
      auth: oauth2Client,
      resource: {
        addLabelIds: addLabelIds,
        removeLabelIds: removeLabelIds
      }
    };
    gmail.users.messages.modify(options, function (err, res) {
      if (err) {
        console.error('Failed To modify message labels', err);
      } else {
        console.log('Successfully modified request labels');
      }
    }); 
  },
  createLabels: function(accessToken,labelList, refreshToken=null){
    const oauth2Client = this.getAuthClient(accessToken, refreshToken);
    for (var i=0; i< labelList.length; ++i){
      console.log(labelList[i])
      var options = {
      userId: 'me',
      auth: oauth2Client,
      resource: {
          name: labelList[i],
          labelListVisibility: "labelHide",
          messageListVisibility: "hide"
        }
      };
      gmail.users.labels.create(options, function (err, res) {
        if (err) {
          console.error('Failed To Create Bit Labels', err);
        } else {
          console.log(res)
          console.log('Successfully Created The Bit Labels');
        }
      });
    }
  }
};
