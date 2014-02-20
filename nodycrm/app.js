
/**
 * Module dependencies.
 */

var express = require('express');
var flash = require('connect-flash');
var util = require('util');
var http = require('http');
var path = require('path');
var passport = require('passport')
var app = express();
var mongoose = require('mongoose');
var MongoStore = require('connect-mongo')(express);

var env = process.env.NODE_ENV || 'development'
  , config = require('./server/config/env')[env]


mongoose.connect(config.db);
// mongoose.connect('mongodb://localhost/nodycrm');
//mongoose.connect('mongodb://admin:nove9021@localhost:27017/nodycrm', function(err) {
//    if (err) throw err;
//});

// all environments (milddleware)
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/server/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
// app.use(express.session({secret: '66NodYCrm01!'}));
app.use(express.session({
  store: new MongoStore({
    url: config.db
  }),
  secret: '66NodYCrm01!',
  cookie: { maxAge : 3600000 *24}
}));
app.use(flash());
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

app.use(express.static(path.join(__dirname, 'public')));

// bootstrap passport config
require('./server/config/passport')(passport)

// Bootstrap routes
require('./server/config/routes')(app, passport)

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Start Server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});