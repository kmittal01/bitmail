const google = require('../google');
const db = require('../db');
const controller = require('./controller');
const config = require('../config');

module.exports = function(app) {
    app.use('/auth/google/callback/', function(req, res) {
      controller.completeAuth(req, res);
    })

    .use('/auth/google/', (req, res) => {
      controller.initAuth(req, res);
    })

    .post('/user/wallet/', (req, res) => {
      controller.setUserWallet(req, res);
    })

    .post('/email/:emailId/bid', function(req, res, next) {
      controller.sendEmailBid(req, res, next);
    })

    .use('/new-email', function(request,response){
      console.log('new Email Received', request.body);
    })

    .use('/googleac53f0beeb7fd695.html', function(request,response){
      response.sendFile(__dirname+'/googleac53f0beeb7fd695.html');
    })
    .use('/wallet/', function(req, res) {
      res.sendFile('wallet.html', { root: config.VIEWS_DIR });
    })
    .use('/email/bid/', function(req, res) {
      res.sendFile('bid.html', { root: config.VIEWS_DIR });
    })
    .use('/', function(req, res) {
      res.sendFile('index.html', { root: config.VIEWS_DIR });
    });

};
