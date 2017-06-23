var express = require('express');        		// call express
var router = express.Router();           		// get an instance of the express Router
var google = require('googleapis');

var OAuth2 = google.auth.OAuth2;
var oauth2Client = new OAuth2(
  "754340727995-696o4ge4a147eqfdcgj1p3jakm3tceip.apps.googleusercontent.com",
  "ozNc3RNb_u1bTojXOOiC25j7",
  "http://127.0.0.1:8887/api/gmail_client/oauth_callback"
);

token = "ya29.GltyBBgSS-S3ywMJe6aKgIR89bboA_Dr4oj5ULnTAAqqVc-psS5a9bsSBFIwCOo0ZSbosn_fys7ZiCqb2TyoGNNyA_H2cmMwNbLHZSNjBfNQ_-6-OwUSoMciXBz-"

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/bitemail";

router.get('/test',function(req, res) {
	var scopes = [
	  'https://www.googleapis.com/auth/plus.me',
	  'https://www.googleapis.com/auth/calendar'
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
		MongoClient.connect(url, function(err, db) {
			if (err) throw err;
			var auth_obj = { email: "Kshitij Mittal", token: token };
			db.collection("auth_tokens").insertOne(auth_obj, function(err, res) {
			if (err) throw err;
			db.close();
			});
		});
		res.json({"token": tokens})
	});
});

module.exports = router;