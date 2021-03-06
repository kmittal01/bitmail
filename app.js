const path = require('path');
const express    = require('express');        // call express
const app        = express();                 // define our app using express
const helmet = require('helmet');
const compression = require('compression');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const nunjucks = require('nunjucks');

const db = require('./db');


const VIEW_DIR = path.join(__dirname, 'public/views')

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
app.use(express.static('public'));
nunjucks.configure(VIEW_DIR, {
    autoescape: true,
    express: app
});

const port = process.env.PORT || 8887;        // set our port

const router = require('./router')(app);
app.use(function(err, req, res, next) {
  console.log('Reaching Here', err);
  res.status(err.status || 500).send(err);
});

module.exports = app;

const server = app.listen(port);
console.log('BitEmail server started on port ' + port);
