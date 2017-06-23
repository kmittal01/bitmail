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

// Allow Cross Domain
app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,HEAD');
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
	res.header("Access-Control-Expose-Headers", "Location");
	next();
});

var port = process.env.PORT || 8887;        // set our port

var router = require('./router')(app);
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
});

module.exports = app;

var server = app.listen(port);

console.log('BitEmail server started on port ' + port);