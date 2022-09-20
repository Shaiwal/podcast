var express = require('express');
var path = require('path');
var log4js = require('log4js');// for POC log4js, though I would like to use winston
var logger = log4js.getLogger();
logger.level = 'debug';
var bodyParser = require('body-parser');

var proxy = require('express-http-proxy');
var awsProxyURL = 'https://s3-us-west-1.amazonaws.com/podcast-asset';


global.appLogger = logger;

const initDb = require('./db');

var app = express();

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';
console.log("port::", port);
console.log("ip::", ip);
app.use(log4js.connectLogger(log4js.getLogger("http"), { level: 'auto' }));//working on connectlogger
app.use(bodyParser.json());// parse application/json

app.all('/*', function(req, res, next) {
  // CORS headers
  res.header("Access-Control-Allow-Origin", "*"); // restrict it to the required domain
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  // Set custom headers for CORS
  res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key');
  res.header('X-FRAME-OPTIONS', 'allow-from https://fdk-stage.cisco.com/');
  if (req.method == 'OPTIONS') {
    res.status(200).end();
  } else {
    next();
  }
});

app.use('/audio', proxy(awsProxyURL, {
  proxyReqPathResolver: function(req) {
    console.log("PATH>> ", req.path);
    return req.path
  }  
}));

app.use('/', require('./routes/router'));
app.use(express.static("./"));

// If no route is matched by now, it must be a 404
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


  initDb.connectToServer( function( err, db ) {

    global.logger = logger;
    global.dbo = db;

    var server = app.listen(port, ip, function() {
      logger.info('App initialted, server address ' , server.address());
      logger.info('App initialted, server listening on port ' + server.address().port);
    });

  } );


