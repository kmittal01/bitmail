const express    = require('express');        // call express
const app        = express();                 // define our app using express
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const db = require('./db');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(helmet());
app.use(compression());
app.use(session({
  secret: 'foo',
  secure: false,
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({ mongooseConnection: db.getConnection() })
}));


const port = process.env.PORT || 8887;        // set our port

const router = require('./router')(app);
app.use(function(err, req, res, next) {
  console.log('Reaching Here', err);
  res.status(err.status || 500).send(err);
});

module.exports = app;

const server = app.listen(port);
console.log('BitEmail server started on port ' + port);
