var express    = require('express');        // call express
var app        = express();                 // define our app using express
var helmet = require('helmet');
var compression = require('compression');
var bodyParser = require('body-parser');
var expressValidator = require('express-validator');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(helmet());
app.use(compression());



var port = process.env.PORT || 8887;        // set our port

var router = require('./router')(app);
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
});

module.exports = app;

var google = require('googleapis');

var plus = google.plus('v1');
var gmail = google.gmail('v1');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(
  "754340727995-696o4ge4a147eqfdcgj1p3jakm3tceip.apps.googleusercontent.com",
  "ozNc3RNb_u1bTojXOOiC25j7",
  "http://127.0.0.1:8887/api/gmail_client/oauth_callback"
);

access_token = "ya29.GlxyBK50vPoyYH7SC3yVTiLO7zL93XE80XZZQ5YNZILBzcLycWWgAHs80JszFPxkwgKTupevluvNz5NTM9-qSY1Q0gix2cR5Ud2cl0OnwCLMQX4THXiM-NIweZtovA"

// Imports the Google Cloud client library
const PubSub = require('@google-cloud/pubsub');

// Your Google Cloud Platform project ID
const projectId = 'bitemailer-171607';

// Instantiates a client
const pubsubClient = PubSub({
  projectId: projectId
});

// The name for the new topic
const topicName = 'gmail_events';

// Creates the new topic
// pubsubClient.createTopic(topicName)
//   .then((results) => {
//   	console.log("here")
//     const topic = results[0];
//     console.log(`Topic ${topic.name} created.`);
//   })
//   .catch((err) => {
//     console.error('ERROR:', err);
//   });
oauth2Client.setCredentials({
      access_token: access_token
    });
var options = {
    userId: 'me',
    auth: oauth2Client,
    resource: {        
        topicName: 'projects/bitemailer-171607/topics/gmail_events'
    }
};

gmail.users.watch(options, function (err, res) {
  console.log('Email Received', err,res);
    if (err) {
        // doSomething here;
        return;
    }
    // doSomething here;
});

var server = app.listen(port);

console.log('BitEmail server started on port ' + port);