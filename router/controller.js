const fs = require('fs');
const google = require('../google');
const db = require('../db');
const eth = require('../eth');
const config = require('../config');

module.exports = {
  initAuth(req, res) {
    const url = google.authorize();
    console.log('Auth URL is ', url);
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
            console.log(resp);
            const sess = req.session;
            sess.user = {
              id: resp._id,
              email: resp.email
            };
            sess.save();
            console.log(req.session, req.sessionID);
            res.status(200).json({
              id: resp._id,
              email: resp.email
            });
          }
        });
      });
  },

  setUserWallet(req, res) {
    const data = req.body;
    const user = req.session.user;
    console.log('Session User', user);
    const contractFile = config.BITMAIL_CONTRACT.PATH;
    const contractName = config.BITMAIL_CONTRACT.NAME;
    const source = fs.readFileSync(contractFile, 'utf8');
    eth.createContract(
      contractName, source, data.accountAddr, (err, contractAddr) => {
        data.contractAddr = contractAddr;
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
  }
}
