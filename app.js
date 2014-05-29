
/**
 * Module dependencies.
 */

var express = require('express');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var path = require('path');
var socketio  = require('socket.io');

var routes = require('./routes');
var api = require('./routes/api');

var resource = require('express-resource');
var app = module.exports = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.set('view options', {
    layout: false
  });

app.use(favicon());
app.use(logger('dev'));
//app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
//app.use(methodOverride());
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname + '/public'));

// Routes

app.get('/', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API

app.get('/api/docsList', api.getDocs);

app.get('/api/MarkdownSimple/:id', api.getDoc);

// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

console.log('listen on 3033');
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3033;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

console.log('listen on:');
console.log(server_port);
console.log(server_ip_address);

var server    = app.listen(server_port, server_ip_address);
var io        = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  console.log('io.sockets.on is connecting?');
});

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        console.log(err.message);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
