const google = require('../google');
module.exports = function(app) {
  app
    .use('/auth/google/callback/', function(req, res) {
      const code = req.query.code;
      google.getUser(req.query.code, (err, user) => {
        console.log('User Auth completed', err, user);
        res.json({
          email: user
        });
      });
    })
    .use('/auth/google/', (req, res) => {
      const url = google.authorize();
      console.log('Auth URL is ', url);
      res.redirect(url);
    })
    .use('/new-email', function(request,response){
      console.log('new Email Received', request.body);
    });
    app.use('/googleac53f0beeb7fd695.html', function(request,response){
       response.sendFile(__dirname+'/googleac53f0beeb7fd695.html');
    });
};
