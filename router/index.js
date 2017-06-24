const google = require('../google');
const db = require('../db');
const controller = require('./controller');

module.exports = function(app) {
  app
    .use('/auth/google/callback/', function(req, res) {
      controller.completeAuth(req, res);
    })

    .use('/auth/google/', (req, res) => {
      controller.initAuth(req, res);
    })

    .post('/user/wallet/', (req, res) => {
      controller.setUserWallet(req, res);
    })

    .use('/email/new/', function(req,res){
    	controller.onEmailReceived(req, res)
    })

    .use('/googleac53f0beeb7fd695.html', function(request,response){
       response.sendFile(__dirname+'/googleac53f0beeb7fd695.html');
    });
};
