// Webserver

// Include SSL server.key and domain.crt from a safe place
var ca, file, files, fs, https, httpsOptions, httpsServer, requestHandler,
express = require('express');


// Start secure webserver
//var keygrip = new Keygrip(["SEKRIT2", "SEKRIT1"]);
var app = module.exports = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.static('public'));
app.use(cookieParser(keys.cookie));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.text({ type: 'text/html' }));
app.use(subdomain({
  domain: keys.site.domain, 
  namespace: 's', 
  www: 'false'
}));

// Create the server object
var server = https.createServer(keys.ssl.lock, app).listen(port, function(){
  //console.log("Express server listening on port " + port);
});

// Start secure socket server
var io = require('socket.io').listen(3000, keys.ssl.lock);