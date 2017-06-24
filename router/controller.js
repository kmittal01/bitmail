const fs = require('fs');
const google = require('../google');
const db = require('../db');
const eth = require('../eth');
const config = require('../config');

module.exports = {
  initAuth(req, res) {
    const url = google.authorize();
    res.redirect(url);
  },

  completeAuth(req, res) {
      const code = req.query.code;
      google.getUser(req.query.code, (err, user) => {
        if (err) {
          res.status(500).send('Failed to authenticate user. Try Again');
          return;
        }
        db.createOrUpdateUser(user.email, user, (err, resp) => {
          if(err) {
            console.error('Failed to authenticate user. Try Again', err);
            res.status(500).send('Failed to authenticate user. Try Again');
          } else {
            const sess = req.session;
            sess.user = {
              id: resp._id,
              email: resp.email
            };
            sess.save();
            res.redirect('/wallet/');
           google.watchMessage(resp.accessToken, null, function(err,result){
              db.updateUser(resp.email, {historyId: result.historyId})
            });
            google.createLabels(user.accessToken,["bitblock","bitmail"])
          }
        });
      });
  },

  setUserWallet(req, res) {
    const data = req.body;
    const user = req.session.user;
    const contractFile = config.BITMAIL_CONTRACT.PATH;
    const contractName = config.BITMAIL_CONTRACT.NAME;
    const source = fs.readFileSync(contractFile, 'utf8');
    eth.createContract(
      contractName, source, data.accountAddr, (err, contractAddr) => {
        data.contractAddr = contractAddr;
        eth.registerEventListener(contractName, contractAddr, 'BidEvent',
                                  this.onBidReceived.bind(this));
        db.updateUser(user.email, data, (err, user) => {
          if(err) {
            console.error('Failed to authenticate user. Try Again', err);
            res.status(500).send('Failed to authenticate user. Try Again');
          } else {
            res.status(200).json({
              id: user._id,
              email: user.email,
              ...data
            });
          }
        });
    });
  },

  onEmailReceived(req,res) {
    const data_obj = JSON.parse(new Buffer(req.body.message.data, 'base64').toString())
    const userEmail = data_obj.emailAddress 
    const historyId = data_obj.historyId
    const messageId = data_obj.messageId
    db.getUserByEmail(userEmail,function(err, user){
      if (user){
        const accessToken = user.accessToken 
        google.handleEmailNotification(userEmail, historyId, messageId, accessToken)
      }
    })
    res.status(200).send()
  },

  onBidReceived(error, result) {
    const senderAddr = result.senderAddr;
    const messageId = result.emailID;
    const bid = result.bid.toNumber();
    db.onBidEmail(messageId, bid);
  },

  _getReceiverForEmail(query, callback) {
    db.getEmailByQuery(q, (err, email) => {
      if (err) {
        callback(err);
        return;
      }
      db.getUserById(email.userId, callback);
    });
  },

  sendEmailBid(req, res, next) {
    const data = req.body;
    const contractName = config.BITMAIL_CONTRACT.NAME;
    this._getReceiverForEmail({ _id: data.emailId }, (err, user) => {
      if (err) {
        next(err);
        return;
      }
      eth.contractTransaction(
        contractName, contractAddr, 'makeEmailBid',
        [email.messageId, expiry], {
          from: senderAddr,
          value: eth.web3.toWei(bid, 'ether')
        }, function(error, result) {
        console.log("Make Bid Result", error, result);
      });
    });
    res.status(204).send();
  },

  onEmailReplied(messageId) {
    this._getReceiverForEmail({ messageId }, (err, user) => {
      if (err) {
        next(err);
        return;
      }
      const contractName = config.BITMAIL_CONTRACT.NAME;
      const contractAddr = user.contractAddr;
      eth.contractTransaction(
        contractName, contractAddr, 'onEmailReplied',
        [messageId], {
          from: user.accountAddr,
        }, function(error, result) {
        console.log("ON Email Replied", error, result);
      });
    });
  }
}
