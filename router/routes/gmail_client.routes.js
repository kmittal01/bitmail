var express = require('express');        		// call express
var router = express.Router();           		// get an instance of the express Router
var google = require('googleapis');

var plus = google.plus('v1');
var gmail = google.gmail('v1');
var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(
  "754340727995-696o4ge4a147eqfdcgj1p3jakm3tceip.apps.googleusercontent.com",
  "ozNc3RNb_u1bTojXOOiC25j7",
  "http://127.0.0.1:8887/api/gmail_client/oauth_callback"
);

access_token = "ya29.GltyBJerxD1-v3iCHNuA6AL7IIU6_VDB2y0UZhCPfetHXCgufn7TG48RJSFk1Bn2gipYBljc-kZirnfplyAsWFWQXQO53I6ym85eBHjwHD5y9D_-1l8HkyrJRhEO"
refresh_token = ""
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/bitemail";

router.get('',function(request,response){
       response.sendFile(__dirname+'/googleac53f0beeb7fd695.html');
    });
router.get('/test',function(req, res) {
	var scopes = [
	  'https://www.googleapis.com/auth/plus.me',
	  'https://www.googleapis.com/auth/calendar',
	  'https://www.googleapis.com/auth/userinfo#email',
	  'https://mail.google.com/'
	];
	var url = oauth2Client.generateAuthUrl({
	  access_type: 'offline',
	  scope: scopes,
	})
		res.json({"status": url})
	});

router.get('/oauth_callback',function(req, res) {
	oauth2Client.getToken(req.query.code, function (err, tokens) {
		if (!err) {
			oauth2Client.setCredentials(tokens);
		}
		plus.people.get({
			  userId: 'me',
			  auth: oauth2Client
			}, function (err, user) {
				console.log(err)
				MongoClient.connect(url, function(err, db) {
					if (err) throw err;
					var auth_obj = { email: user.emails[0].value, token: tokens["access_token"]};
					db.collection("user").insertOne(auth_obj, function(err, res) {
					if (err) throw err;
					db.close();
					});
				});
			res.json({"token": tokens})
		});
	});
});

router.get('/emails',function(req, res) {
		oauth2Client.setCredentials({
		  access_token: access_token
		});
		gmail.users.messages.list({
			  userId: 'me',
			  auth: oauth2Client
			}, function (err, response) {
				console.log(err)
			  res.json({"user":response})
		});
});
// router.get('/me',function(req, res) {
// 		oauth2Client.setCredentials({
// 		  access_token: access_token
// 		});
// 		plus.people.get({
// 			  userId: 'me',
// 			  auth: oauth2Client
// 			}, function (err, response) {
// 				console.log(err)
// 			  res.json({"user":response})
// 		});
// });
module.exports = router;