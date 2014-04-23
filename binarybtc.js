var port = 8080
  , fs = require('fs')
  , url = require('url')
  , path = require('path')
  , http = require('http')
  , nowjs = require('now')
  , https = require('https')
  , express = require('express')
  , mongoose = require('mongoose')
  , redis = require('redis')
  , passport = require('passport')
  , Keygrip = require('keygrip')
  , bitcoin = require('bitcoin')
  , bson = require('bson')
  , async = require('async')
  , LocalStrategy = require('passport-local').Strategy
  , StringDecoder = require('string_decoder').StringDecoder
  , mailer = require('mailer')
  , irc = require('irc')
  , authy = require('authy-node');


// Global clock
var date = 0;
var time = 0;
var clock = setInterval(function() {
  time = new Date().getTime();
  date = new Date();
  checknextTrade(); // Check for the next trade
  io.sockets.emit('servertime', time);
}, 1000);


// Database connect
fs.readFile('/home/node/keys/mongo.key', 'utf8', function (err,data) {
  if (err) throw (err)
  var key = data.replace("\n", "").replace("\r", "");
  mongoose.connect(key);
  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function callback () {
    console.log('Database connected on port 27017');
  });
});
// Setup database schemas and models
var schema = new mongoose.Schema({ key: 'string', user: 'string', createdAt: { type: Date, expires: '1h' }});
var Activeusers = mongoose.model('activeusers', schema);
var schema = new mongoose.Schema({ username: 'string', createdAt: { type: Date, expires: '1h' }});
var Userfirewall = mongoose.model('userfirewall', schema);
var schema = new mongoose.Schema({ ip: 'string', time: 'string', handle: 'string' });
var Pageviews = mongoose.model('pageviews', schema);
var schema = new mongoose.Schema({ symbol: 'string', price: 'string', offer: 'string', amount: 'string', direction: 'string', time: 'string', user: 'string' });
var Activetrades = mongoose.model('activetrades', schema);
var schema = new mongoose.Schema({ symbol: 'string', price: 'string', offer: 'string', amount: 'string', direction: 'string', time: 'string', user: 'string', outcome: 'string' });
var Historictrades = mongoose.model('historictrades', schema);
var schema = new mongoose.Schema({ symbol: 'string', chart: 'string'});
var Historicprices = mongoose.model('historicprices', schema);
var schema = new mongoose.Schema({ from: 'string', to: 'string', amount: 'string', txid: 'string', time: 'string'});
var Sentpayments = mongoose.model('sentpayments', schema);
var schema = new mongoose.Schema({ option: 'string', setting: 'string'});
var Globalvars = mongoose.model('globalvars', schema);
var schema = new mongoose.Schema({ username: 'string', phone: 'string', id: 'string'});
var Userauth = mongoose.model('userauth', schema);
var schema = new mongoose.Schema({ direction: 'string', username: 'string', address: 'string', amount: 'string', status: 'string', confirmations: 'string', tx: 'string', to: 'string', time: 'string'});
var Usertx = mongoose.model('usertx', schema);
var schema = new mongoose.Schema({ timer: 'string',chat: 'string' });
var Userprefs = mongoose.model('userprefs', schema);
// Empty temporary database
Pageviews.remove({}, function(err) {
  if (err) console.log(err);
});
// Activetrades.remove({}, function(err) {
//   if (err) console.log(err);
// });


// Key value connect and money handling
  fs.readFile('/home/node/keys/redis.key', 'utf8', function (err,data) {
    if (err) throw (err);
    var key = data.replace("\n", "").replace("\r", "");
    var options = {
      auth_pass: key
    }
    rclient = redis.createClient(null, null, options);
  });
function pay(amount, tradeuser) {
  amount = round(amount, 6);
  rclient.get('myaccount', function(err, reply) {
    if (err) throw (err)
      var updatedbank = round(+reply-amount,6);
      rclient.set('myaccount', updatedbank, function(err, reply) {
        if (err) throw (err)
          rclient.get(tradeuser, function(err, reply) {
          if (err) throw (err)
            var updatedbal = round(+reply+amount,6);
            rclient.set(tradeuser, updatedbal, function(err, reply) {
              if (err) throw (err)
                return;
            });
          });
      });
  });
}function collectbank(amount, tradeuser, cb) {
  amount = round(amount, 6);
  rclient.get(tradeuser, function(err, reply) {
    if (err) throw (err)
      var updatedbal = round(+reply-amount,6);
      rclient.set(tradeuser, updatedbal, function(err, reply) {
        if (err) throw (err)
          rclient.get('myaccount', function(err, reply) {
          if (err) throw (err)
            var updatedbal = round(+reply+amount,6);
            rclient.set('myaccount', updatedbal, function(err, reply) {
              if (err) throw (err)
                cb(reply);
            });
          });
      });
  });
}

// 2 Factor
fs.readFile('/home/node/keys/authy.key', 'utf8', function (err,data) {
  if (err) throw (err)
  var key = data.replace("\n", "").replace("\r", "");
  authy.api.mode = 'production'
  authy.api.token = key;
});


// Webserver

// Include SSL server.key and domain.crt from a safe place
var ca, file, files, fs, https, httpsOptions, httpsServer, requestHandler;
files = ["EssentialSSLCA_2.crt", "ComodoUTNSGCCA.crt", "UTNAddTrustSGCCA.crt", "AddTrustExternalCARoot.crt"];
ca = (function() {
  var _i, _len, _results;
  _results = [];
  for (_i = 0, _len = files.length; _i < _len; _i++) {
    file = files[_i];
    _results.push(fs.readFileSync("/home/node/keys/" + file));
  }
  return _results;
})();

var options = {
  ca: ca,
  key: fs.readFileSync('/home/node/keys/server.key'),
  cert: fs.readFileSync('/home/node/keys/vbit_io.crt')
}
// Start secure webserver
//var keys = new Keygrip(["SEKRIT2", "SEKRIT1"]);
var app = module.exports = express();
app.configure(function() {
  app.use(express.static('public'));
  app.use(app.router);
  app.use(express.cookieParser('SEKRIT1'));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(express.bodyParser());
});
app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
// Create the server object
var server = https.createServer(options, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});

// Start secure socket server
var io = require('socket.io').listen(3000, options);
io.set('log level', 1); // reduce logging

// User Middleware
var User = require('user-model');



// Tradeserver Variables
              //Bitcoin and Crypto
var symbols = ['BTCUSD', 'BTCCNY', 'AAPL', 'GOOG'];

var bank;
var put = 0;
var call = 0;
var maxamount = 20; // the max amount a user can set for any one trade
var maxoffset = { bottom: 75, top: 25 };
var cuttrading = 0; // seconds before trading where the user is locked out from adding a trade (zero to disable)
var offer = 0.7;
var tradeevery = 5; // Defaut time in minutes before trading again
var userNumber = 1;
var userbalance = new Array();
var trades = new Array();
var signupsopen = true; // Allow signups?
var tradingopen = true; // Allow trading? -proto
var diff = {};
var users = {};
var price = {};
var ratio = {};
var balance = {};
var calls = {};
var puts = {};
var totalcall = {};
var totalput = {};
var y = new Array();
var x = new Array();
var z = new Array();
var a = 0;
var processedtrades = new Array();


// The wild-west of functions

// Check if a user exists
function userCheck(username) {
  var usern = null;
  // fetch user and test password verification
  User.findOne({ username: username }, function(err, user) {
    if (err) throw err;
    if (user != null){
    usern = user.username;
    }
  });
  // return the username or null
  return usern;
}
// Check if a username and password are true
function userFetch(username, password) {
  // Find the user in the database
  User.findOne({ username: username }, function(err, user) {
    if (err) throw err;
    if (user) {
     // Test the supplied password using middleware
    user.comparePassword(password, function(err, isMatch) {
         if (err) throw err;
         // return true or false
         return isMatch;
    });
  }
});
}

// Master trade function
//=trade
function trade() {
  var index;//Loop the trades
  var processedtrades = new Array();
    for (index = 0; index < trades.length; ++index) {
      var entry = trades[index]; ///example data
      var tradesymbol = entry[0]; //BTCUSD
      var tradeprice = entry[1]; //600
      var offer = entry[2]; //0.75
      var amount = entry[3];//5
      var direction = entry[4]; //Call
      var tradetime = entry[5]; //1393712774917
      var tradeuser = entry[6]; //Guest123
      var outcome = null; //Win
      var winnings = 0;//7

      // Check the direction and calculate the outcome
      if (direction == 'Put'){
        if (tradeprice > price[tradesymbol]){
          winnings = (+amount+(amount*offer));
          outcome = 'Win';
          //Update user balance and move winnings out of the bank
          pay(winnings, tradeuser);
        } else if (tradeprice < price[tradesymbol]) {
          outcome = 'Lose';//Lose
          // User lost put
        } else if (tradeprice == price[tradesymbol]) {
          outcome = 'Tie';
          pay(amount, tradeuser);
        }
      } else if (direction == 'Call'){
        if (tradeprice < price[tradesymbol]){
          outcome = 'Win';
          winnings = (amount+(amount*offer));
          pay(winnings, tradeuser, function(outcome) {

          });
        } else if (tradeprice > price[tradesymbol]) {
          outcome = 'Lose';//Lose
          // User loses call
        } else if (tradeprice == price[tradesymbol]) {
          outcome = 'Tie';
          pay(amount, tradeuser);
        }
      }

      //console.log(tradeuser + ' ' + outcome + ' ' + amount);

    // Store the processed trades in the db
    var dbhistorictrades = new Historictrades({
      symbol: tradesymbol,
      price: tradeprice,
      offer: offer,
      amount: amount,
      direction: direction,
      time: time,
      user: tradeuser,
      outcome: outcome
    });
    dbhistorictrades.save(function (err) {
      if (err) console.log(err)
      // and in the ram

    });
          processedtrades.push({
        symbol: tradesymbol,
        price: tradeprice,
        offer: offer,
        amount: amount,
        direction: direction,
        time: time,
        user: tradeuser,
        outcome: outcome
      });
    ratio[tradesymbol] = 50;
    }//foreach trade
    processTrade(processedtrades);

  // empty the ram and database of old objects
  x = new Array(); //win
  y = new Array(); //tie
  z = new Array(); //lose
  t = new Array(); //totals
  calls = {};
  puts = {};
  totalcall = {};
  totalput = {};
  trades = new Array();
  Activetrades.remove({}, function(err) {
  if (err) console.log(err);
  });
}


// Add a trade for a user
function addTrade(symbol, amount, direction, user, socket) {
  var err = {};
  symbol = symbolswitch(symbol);

  // Check the amount
  if (amount > 0) {
  // Check the direction and make sure price[symbol] exists
  if (direction == 'Call' || direction == 'Put' && price[symbol]) {
    // Put the amount info a number
    amount = Number(amount);
    // Check if the amount is over maxamount
    if (amount <= maxamount) {
      // Check if the amount is over the user balance
      if (userbalance[user] >= amount) {

        if (direction == 'Call' && ratio[symbol] > maxoffset.bottom) {
          // The direction is invalid
              err.sym = symbol;
              err.msg = 'Call';
              socket.emit('tradeerror', err);
          return false;
        }else if (direction == 'Put' && ratio[symbol] < maxoffset.top) {
          // The direction is invalid
              err.sym = symbol;
              err.msg = 'Put';
              socket.emit('tradeerror', err);
              return false;
        } else {
          var now = time;

          // Move the users funds to the bank
          collectbank(amount, user, function() {

          // Adjust the totals
          if (direction == 'Call') {
            if (calls[symbol]) {calls[symbol]++;}else {calls[symbol] = 1}
            if (totalcall.symbol) {
              var totalcallsi= Number(totalcall.symbol) + Number(amount);
            } else {
              var totalcallsi= Number(amount);
            }
            totalcall = { symbol: totalcallsi };
          } if (direction == 'Put') {
              if (puts[symbol]) { puts[symbol]++; }else {puts[symbol] = 1}
            if (totalput.symbol) {
              var totalputsi= Number(totalput.symbol) + Number(amount);
            } else {
              var totalputsi= Number(amount);
            }
            totalput = { symbol: totalputsi };
          }
          if (!totalcall.symbol) { totalcall.symbol = 0; }
          if (!totalput.symbol) { totalput.symbol = 0; }

          if (totalcall.symbol > totalput.symbol) diff[symbol] = (totalcall.symbol - totalput.symbol);
          if (totalcall.symbol < totalput.symbol) diff[symbol] = (totalput.symbol - totalcall.symbol);
          if (totalcall.symbol == totalput.symbol) diff[symbol] = 0;

            // Add the two sides to make a total
          var t = Number(totalcall.symbol) + Number(totalput.symbol);

          // Create a ratio percentage
          ratio[symbol] = round(Number(totalcall.symbol) / Number(t) * 100);


          // Insert the trade into the database
          var dbactivetrades = new Activetrades({
            symbol: symbol,
            price: price[symbol],
            offer: offer,
            amount: amount,
            direction: direction,
            time: now,
            user: user
          });
          dbactivetrades.save(function (err) {
            if (err) throw (err);
            // Announe the trade
            console.log('New trade:'+user +':'+ symbol+':'+direction+':'+amount);
            console.log('Total Call '+symbol+':'+totalcall.symbol);
            console.log('Total Put '+symbol+':'+totalput.symbol);
            console.log('Ratio '+symbol+' %'+ratio[symbol]);
            console.log('Raw Difference: '+diff[symbol]);
              // Insert the trade into the ram
              var tradeinit = new Array();
              tradeinit[0] = symbol;
              tradeinit[1] = price[symbol];
              tradeinit[2] = offer;
              tradeinit[3] = amount;
              tradeinit[4] = direction;
              tradeinit[5] = now;
              tradeinit[6] = user;
              trades.push(tradeinit);
              socket.emit('ratios', ratio);
              socket.emit('tradeadded', symbol);
              socket.emit('activetrades', trades);
              a++;
              return true;
          });
        });
      }

    } else {
      // The amount is larger than the user's balance
      err.sym = symbol;
      err.msg = 'Balance';
      socket.emit('tradeerror', err);
      return false;
    } // err
  } else {
    // The amount is over the max ammount
    err.sym = symbol;
    err.msg = 'High';
    socket.emit('tradeerror', err);
    return false;
  }
  } else {
    // The direction is invalid
    err.sym = symbol;
    err.msg = 'Pick';
    socket.emit('tradeerror', err);
    return false;
  }
  }else {
    // The amount is not over zero
    err.sym = symbol;
    err.msg = 'Pick';
    socket.emit('tradeerror', err);
    return false;
  }
}

var nexttrade = new Array();
var nexttradesecs = tradeevery*60;
// Calculate the next trade
function checknextTrade() {
  // Get minutes in the global date object [10:01:02AM]
  var mins = date.getMinutes(); // [01]
    mins = (59-mins) % tradeevery; // Trade every % ten minutes
  // Get seconds
  var secs = date.getSeconds(); // [02]
  if (secs != 60){
    secs = (59-secs) % 60;
  } else {
    secs = 00;
  }
  nexttrade = [Number(mins),Number(secs)];  // Put the next trade in an array [8:58]
  nexttradesecs = (mins*60)+secs;
  //console.log(nexttradesecs);
  io.sockets.emit('nexttrade', nexttrade); // Emit to chrome
  //console.log(mins+':'+secs);
  // If it's time to trade
  if (nexttrade[0] == 0 && nexttrade[1] == 0){
    trade();
  }
}

// Proto trade shaping
// function calculateImbalance(symbol) {
//   Activetrades.find({symbol: symbol},function(err,trades){
//     trades.forEach(function(elem, index, array) {
//       elem.offer = "apple";
//       elem.amount =
//     elem.save();
// });
// }
// }


function getUsers () {
   var userNames = [];
   for(var name in users) {
     if(users[name]) {
       userNames.push(name);
     }
   }
   return userNames;
}



// price and chart updaters

var i = 0;
var lastentry, firstentry, timewindow, chartsymbol, lastprice;
var chartdata = [];
var chart = {};

function updatePrice(data, force, symbol) {
   // if (lastprice != data) {
      io.sockets.emit(symbol+'_price', data);
      updateChart(data, symbol);
      chartPoint(data, symbol);
   // }
}
          chartdata = [];
function updateChart(data, symbol, force) {
      //if (data != lastchart || force) {
          chartsymbol = symbol + '_chart';

        if (Number(data)) {
          if (chart[symbol]) {
            chartdata = chart[symbol];
          } else {
            chartdata = [];
          }
          chartentry = new Array(time, Number(data));
          chartdata.push(chartentry);
          chart[symbol] = chartdata;
//          console.log('Charting '+symbol+' : '+chart[symbol]);
          io.sockets.emit(chartsymbol, chart[symbol]);

          Historicprices.find({ symbol: symbol }, function(err, docs) {
            if (err) throw (err);
            //docs = docs[0];
            //console.log(docs);
            if (docs) {
              Historicprices.update({ symbol: symbol }, { chart: chart[symbol] }, function (err, numberAffected, raw) {
              if (err) throw (err)
              });
            } else {
              var hicharter = new Historicprices({
                symbol: symbol
              });
              hicharter.save(function(err){
                if (err) throw (err)
              });
            }
          });

          lastchart = data;
            if (i == 0) {
              firstentry = time;
              lastentry = time;
            } else {
              lastentry = time;
            }
              i++;
              timewindow = lastentry - firstentry;
             if (timewindow > 1800000) {
              i--;
              chartdata.shift();              
            }
      }
    //}
}

// Emit a single updated chart point for the client
function chartPoint (data, symbol) {
          chartsymbol = symbol + '_updatedchart';
        if (Number(data)) {
          chartentry[symbol] = [time, Number(data)];
          io.sockets.emit(chartsymbol, chartentry[symbol]);
          //console.log(chartsymbol + ':' + chartentry[symbol]);
      }
}


var tradeupdater = setInterval(function() {
  var symbols = ['BTCUSD', 'BTCCNY', 'AAPL', 'GOOG'];

  async.each(symbols,function (symbol, callback) {
      getPrice(symbol, 1);
    }, function (err) {
      if (err) throw(err);
  });
}, 2753);


User.count({ }, function (err, count) {
  if (err) throw(err);
  userNumber = (userNumber+count);
});

// Fill the ram with active trades from the database
Activetrades.find({ },function(err, data) {
  if (err) throw (err)
    for (var i = 0; i<data.length; i++){
      var trade = data[i];
      var tradeinit = new Array();
        tradeinit[0] = trade.symbol;
        tradeinit[1] = trade.price;
        tradeinit[2] = trade.offer;
        tradeinit[3] = trade.amount;
        tradeinit[4] = trade.direction;
        tradeinit[5] = trade.now;
        tradeinit[6] = trade.user;
        trades.push(tradeinit);
    }
    io.sockets.emit('activetrades', trades);
});

// Socketeering
//=socks
var myName, myNumber;
// User Connects
io.sockets.on('connection', function (socket) {
  var hs = socket.handshake;
  var ipaddress = hs.address; //ipaddress.address/ipaddress.port
  ipaddress = ipaddress.address;

  for (index = 0; index < symbols.length; ++index) {
      io.sockets.emit(symbols[index]+'_price', price[symbols[index]]);
      io.sockets.emit(symbols[index]+'_chart', chart[symbols[index]]);
  }

  io.sockets.emit('symbols', symbols);
  var userpage = new Array();
  var useraddress = new Array();
  var dualFactor = new Array();
  var dualFactorid = new Array();
  var email = new Array();

  io.sockets.emit('tradingopen', tradingopen); // Update trading status
  socket.on('page', function (data) {
    userpage[myName] = data.page;
    socket.emit('loadpage', {page: data.page, symbol: data.symbol, guest: data.guest});
  });

  // Check the users cookie key
  checkcookie(socket, function(myName, isloggedin) { // isloggedin = true/false
// Everything inside


  // Get the user's balance
  rclient.get(myName, function(err, reply) {
  if (reply && reply != null && reply != 'NaN') {
  userbalance[myName] = reply;
  } else {
  userbalance[myName] = 0;
  }
  });

  // Assign them a number
  myNumber = userNumber++;
  if (!myName) { myName = 'Guest'+myNumber; }
  // Assign them a socket
  users[myName] = socket;

  // Say hello
  console.log('hello ' + myName + ' id' + myNumber)


    //email[myName] = docs.email;

  Userauth.findOne({ username: myName }, function (err, docs) {
    if (err) throw (err)
    //console.log(docs);
    if (docs && docs != null) {
    dualFactor[myName] = true;
    dualFactorid[myName] = docs.id;
      User.findOne({ username: myName }, function (err, docx) {
      if (err) throw (err)
       console.log(myName+' dual factor: '+dualFactor[myName]+' '+dualFactorid[myName]);
       socket.emit('hello', { hello: myName, id: myNumber, email: docx.email, verified: docx.emailverified, dualfactor: dualFactor[myName] });
      });
    } else {
      User.findOne({ username: myName }, function (err, docx) {
      socket.emit('hello', { hello: myName, id: myNumber, email: docx.email, verified: false, dualfactor: false });
      });
    }
  });
  socket.emit('userbal', { name: myName, balance: userbalance[myName] }); // Update userbalance
  //Send user current data on connect

    Historictrades.find({ user: myName }).sort({time:-1}).find(function(err, historictrades) {
    socket.emit('historictrades', historictrades);
  });
  User.find({ username: myName }, function (err, user) {
    user = user[0];
    email = user.email;
    //console.log(user.role);
    if (user.username == 'crunk') {

      console.log('Admin ' + myName + ' connected from '+ipaddress);
      socket.emit('loadpage', {page: 'admin'});
      userpage[myName] = 'admin';
      
      var lastbal;
      var admintimer = setInterval(function() {
      //displayAccounts(function(err, data){
      Usertx.find({ }, function(err, data){
        if (err) throw (err);
          serverBalance(function(err, bal){
          if (err) throw (err);
            data.push( {bal : bal} );
            socket.emit('remotebals', data);
        });
        
      });      
   
        serverBalance(function(err, bal){
          if (err) throw (err);
            socket.emit('serverbalance', bal);
        });

      User.find({ }, function (err, data) {
        if (err) throw (err);
        var accs = new Array();
        data.forEach(function(user) {
          rclient.get(user.username, function (err,register) {
            if (err) throw (err);
              accs.push({
                account: user.username,
                address: user.btc,
                bal: register
              });
              if (accs.length === data.length) {
                socket.emit('localbals', accs);
              }
          });
        });
      });

    }, 1000);

    }
  });

  // Emit any active trades on pageload
  if (trades) {
    socket.emit('activetrades', trades);
  }

  // Pass new trade details from the socket to addTrade
  socket.on('trade', function (data) {
    if (data.user == myName) {
      // Check if input data is valid
      var re = new RegExp(/[\s\[\]\(\)=,"\/\?@\:\;]/g);
      if (re.test(data.amount)) { console.log('Illegal trade input from '+myName); } else {
        // Push data to addTrade
        //console.log('add trade for ' + data.user);
        addTrade(data.symbol, data.amount, data.direction, data.user, socket);
        // Emit active trades again
        socket.emit('activetrades', trades);
      }
    }
  });

  // Proto action socket listener
  socket.on('action', function (data) {
    console.log('action: '+data);
  });

  //})

  // Create a general script updater
  var updater = setInterval(function() {
    socket.emit('userbal', { name: myName, balance: userbalance[myName] }); // Update userbalance
    socket.emit('username', myName); // Update userbalance
    if (trades) socket.emit('activetrades', trades); // Update active trades
    Historictrades.find({ user: myName }).sort({time:-1}).find(function(err, historictrades) {
      socket.emit('historictrades', historictrades);
    });
    io.sockets.emit('tradingopen', tradingopen); // Update trading status
    socket.emit('ratios', ratio); // Update ratios
    io.sockets.emit('listing', getUsers()); // Update user listing
    // Balance updater
    rclient.get(myName, function(err, reply) {
    if (reply && reply != null && reply != 'NaN') {
    userbalance[myName] = reply;
    } else {
    userbalance[myName] = 0;
    }
    });
  // Get the user's bitcoin address and balance
    User.find({ username: myName }, function(err, docs) {
      if (err) throw (err)
      docs = docs[0];
      useraddress[myName] = docs.btc;
      if (docs.logins) socket.emit('logins', docs.logins);
      rclient.get(myName, function (err, bal) {
        if (err) throw (err)
        socket.emit('wallet', {address: useraddress[myName], balance: bal}); // Update useraddress
      });
    });

    listtx(myName, function (err, data) {
      if (err) throw (err);
      socket.emit('wallettx', data); 
    });
  },750); // Run every second



// User functions

  function emittx(tx) {
    Usertx.findOne({tx: tx}, function(err, docs){
      if (err) throw (err)
      var colour = 'blue'
      if (status == 'confirmed') colour = 'green';
      var text = 'A payment of <i class="fa fa-bitcoin">'+docs.amount+' has been recieved.';
      if (status == 'confirmed') var text = '<i class="fa fa-bitcoin">'+docs.amount+' has been added to your account.';
      socket.emit('alertuser', {message: text, trinket: 'yo!', colour: colour});
    });
  }  
  function emitsend(tx) {
    Usertx.findOne({tx: tx}, function(err, docs){
      if (err) throw (err)
      var text = 'A payment of <i class="fa fa-bitcoin">'+docs.amount+' has been queued for sending.';
      var colour = 'orange';
      socket.emit('alertuser', {message: text, trinket: 'yo!', colour: colour});
    });
  }
  function emitsent(tx) {
    Usertx.findOne({tx: tx}, function(err, docs){
      if (err) throw (err)
      var text = '<i class="fa fa-bitcoin">'+docs.amount+' has been delivered to .';
      var colour = 'blue';
      socket.emit('alertuser', {message: text, trinket: 'yo!', colour: colour});
    });
  }

 // Emit trade objects
  io.sockets.emit('totalcall', call);
  io.sockets.emit('totalput', put);
  //io.sockets.emit('option', symbol);
  io.sockets.emit('offer', offer);

  // Protochat
var irclient = new irc.Client('irc.twitt.ch', myName, {
  channels: ['#deetz'],
});
irclient.addListener('message#deetz', function (from, message) {
  io.sockets.emit('chat', {from:from, message:message});
});


  socket.on('chat', function (message) {
    irclient.say('#deetz', message);
  });
  socket.on('message', function (data) {
    irclient.say(data.user, data.message);
  });

// User disconnects
  socket.on('disconnect', function () {
    irclient.disconnect('disconnected');
    console.log(myName+' disconnected');
    //users[myName] = null;
    //userbalance[myName] = null;
    // if (guest == true) {
    //   Historictrades.remove({ user: myNumber }, function (err) {
    //   if (err) throw(err);
    //   });
    // }
    clearInterval(updater);
    //if (slowupdater) clearInterval(slowupdater);
    io.sockets.emit('listing', getUsers());
  });


  }); // Cookies


});

// Express webservice

// Use the Views directory
app.use('/', express.static(__dirname + '/views'));
// Send index
app.get('/', function(req,res) {
  res.render('index', {
    user: true,
    col: 2
  });

});

app.get('/btcstatus', function(req, res, next){
loginfo();
});

app.get('/2f/add/:user/:country/:phone', function(req, res, next){
  var un = req.params.user;
  var ph = req.params.phone;
  var ca = req.params.country;
  User.findOne({ username: un }, function(err, user) {
    if (err) {
      res.send(err);
    } else {
        authy.register( user.email, ph, ca, function (err, data) {
          if (err) res.send(err);
          if (data) {
          if (data.success) {
                var u = data.user;
              var newAuth = new Userauth({
                username: un,
                phone: ca+ph,
                id: u.id
              });
            // save user to database
            newAuth.save(function(err) {
              if (err) throw (err);
              res.send('OK');
            });
          }}
        });
    }
  });
});

app.get('/2f/remove/:user', function(req, res, next){
  var user = req.params.user;
  authy.app.delete(user, function (err, data) {
    if (err) res.send(err);
    res.send(data);
  });
});

app.get('/2f/sms/:user', function(req, res, next){
  var user = req.params.user;
  authy.sms( user, function (err, data) {
    if (err) res.send(err);
    res.send(data);
  });
});

app.get('/2f/auth/:user/:code', function(req, res, next){
  var usr = req.params.user;
  var code = req.params.code;

  Userauth.findOne({ username: usr }, function(err, user) {
    if (err) {
      res.send('DB Error');
    } else {
      console.log('checking '+usr+' auth token ' + user.id+' code '+code);
      authy.verify( user.id, code, function (err, data) {
        if (err) {
          res.send('Authy Error');
          //throw (err);
        } else {
        res.send(data);
      }
      });
    }
  });
});

app.get('/2f/details', function(req, res, next){
  authy.app.details(function (err, data) {
    if (err) res.send(err);
    res.send(data);
  });
});

app.get('/2f/stats', function(req, res, next){
  authy.app.stats(function (err, data) {
    if (err) res.send(err);
    res.send(data);
  });
});

app.get('/addtx/:txid', function(req, res, next) {
  var tx = req.params.txid;
  if (tx.length == 64) {
    Usertx.find({ "tx": tx }, function (err, data) {
      data = data[0];
      if (data) {
      res.send(data);
    } else {
        //console.log(data);
        var options = {
          host: 'blockchain.info',
          port: 80,
          path: '/tx-index/'+tx+'/?format=json'
        };
        http.get(options, function(resp){

          var decoder = new StringDecoder('utf8');
          resp.on('data', function(chunk){
            if (chunk) {
            chunk = decoder.write(chunk);
            try{
                var obj = JSON.parse(chunk); 
            }catch(e){
               throw ('checktx json parse error from: '+e);
            }            
            var address = obj.out[0].addr;
            var amount = (+obj.out[0].value/100000000).toFixed(8);
            var txtime = obj.time;
            var confirmations = 0;
            
            User.find({ btc: address }, function (err, docs) {
              docs = docs[0];
              if (docs) {
                if (!docs.username) var un = 'myaccount';
                if (docs.username) var un = docs.username;
                console.log('Recieved '+amount+' from '+un);
                var newTx = new Usertx({
                  direction: 'in',
                  username: un,
                  address: address,
                  amount: amount,
                  status: 'new',
                  confirmations: confirmations,
                  tx: tx,
                  time: txtime,
                });

                newTx.save(function(err) {
                  if (err) throw (err);
                  res.send('OK');
                  //tx
                  checktx(tx);
                  emittx(tx);
                }); 
              } else {
                res.send('NO DOCS');
              }
            });
          } else {
            res.send('NO CHUNK');
          }
          });
        });
    }
   });
  } else {
    res.send('NOT VALID');
  }
});

Usertx.find({}, function(err, docs) {
  for (var i = 0; i < docs.length; i++) { 
    var doc = docs[i];
    checktx(doc.tx);
  }
});

txchecker = new Array();
function checktx(tx){ 
  txchecker[tx] = setInterval(function() {
    var options = {
      host: 'api.biteasy.com',
      path: '/blockchain/v1/transactions/'+tx+''
    };
    https.get(options, function(resp){
      var decoder = new StringDecoder('utf8');
      resp.on('data', function(chunk){
        if (chunk) {
          chunk = decoder.write(chunk);
          try{
              var obj = JSON.parse(chunk); 
          }catch(e){
             throw ('checktx json parse error from: '+e);
          }
          if(obj.data) {
         var confirmations = obj.data.confirmations;
         console.log('Updating tx'+tx+' with '+confirmations+' confirmations');
          Usertx.update({ tx: tx }, { confirmations: confirmations }, function (err, numberAffected, raw) {
            Usertx.findOne({ tx: tx }, function (err, docs) {
              if (docs) {
                if (confirmations > 1 && docs.status == 'new') poptx(tx);
                if (confirmations > 100) clearInterval(txchecker[tx]);
              }
            });
          });
          }
        }
      });
    });
  },44466); 
}function poptx(tx){
  Usertx.findOne({tx:tx}, function(err, doc){ 
    if (err) throw (err);
    if (doc.status == 'new' && doc.status != 'confirmed') {
    rclient.get(doc.username, function(err, data){
      if (err) throw (err);
      var am = (+doc.amount*1000);
      var nam = (+data+am);
      rclient.set(doc.username, nam, function(err, tdata) {
        if (err) throw (err)
        Usertx.update({ tx: tx }, { status: 'confirmed' }, function (err, numberAffected, raw) {
          if (err) return handleError(err);
        }); 
      }); 
    });
    }
  });
}

app.get('/checkusername/:data', function(req, res, next){
  var un = req.params.data;
  var query  = User.where({ username: un });
  query.findOne(function (err, user) {
    if (err) throw (err);
    if (user) res.send('NO');
    if (!user) res.send('OK');
  });
});app.get('/checkemail/:data', function(req, res, next){
  var em = req.params.data;
  var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var query  = User.where({ email: em });
  query.findOne(function (err, user) {
    if (err) throw (err);
    if (user || re.test(em) == false) res.send('NO');
    if (!user && re.test(em)) res.send('OK');
  });
});app.get('/checkpass/:data', function(req, res, next){
  var pwd = req.params.data;
  var matches = pwd.match(/\d+/g);

  if (pwd.length > 5 && matches) {
    res.send('OK');
  } else {
    res.send('NO');
  }
});


// Proto
app.get('/nexttrade', function(req, res, next){
  res.send(nexttrade[0]+':'+nexttrade[1]);
});app.get('/tradeevery', function(req, res, next){
  res.send(tradeevery);
});app.get('/secs', function(req, res, next){
  res.send(nexttradesecs);
});app.get('/progress', function(req, res, next){
  var secs = ((+nexttrade[0]*60)+nexttrade[1]);
  var every = (+tradeevery * 60);
  var progress = ((+tradeevery/secs)*10);
  res.send(progress);
});



app.get('/send/:usr/:add/:am/:auth', function(req, res, next){
  var usr = req.params.usr;
  var amount = (+req.params.am/1000);
  var mamount = req.params.am;
  var to = req.params.add;
  var code = req.params.auth;
  var from = 'myaccount';
  Userauth.findOne({ username: usr }, function(err, user) {
    if (err) {
      res.send('DB Error');
    } else {
      authy.verify( user.id, code, function (err, data) {
        //console.log(data);
        if (err) {
          res.send('Authy Error');
        } else if (data.token == 'is valid') {
          rclient.get(user.username,function (err, userbal) {
            if (err) {
              res.send('Balance Error');
            } else {
              if (userbal < amount) {
                res.send('Balance');
              } else if (userbal >= mamount) {
                var newTx = new Usertx({
                  direction: 'out',
                  amount: amount,
                  status: 'review',
                  time: time,
                  to: to,
                  username: user.username
                });
                newTx.save(function(err){
                  if (err) throw (err);
                  var newbal = (+userbal - mamount);
                  rclient.set(user.username, newbal, function (err, userbal) {
                  if (err) throw (err);
                  res.send('OK');
                  });
                });
                // sendfrom('myaccount', to, amount, function(err, result, resHeaders) {
                // if (err) { res.send('NO'); } else { res.send('OK'); } 
                // });
              }
            }
          });
      }
      });
    }
  });
});

var masteratts = 0;

app.get('/mastersend/:pwd/:to', function(req, res, next) {
  if (masteratts < 5) {
    var pwd = req.param('pwd', null);
    var to = req.param('to', null);
    fs.readFile('/home/node/keys/send.key', 'utf8', function (err, data) {
      if (err)  {
        res.send('KEY ERROR');
      } else {
      var key = data.replace("\n", "").replace("\r", "").replace(" ", "");
      //console.log('trying lock '+key+' with '+pwd);
      if (pwd && key && to && pwd == key) {
      Usertx.findOneAndUpdate({to: to, status: 'review'}, {status: 'send'}, function(err, docs) {
        if (err) {
          res.send(err);
        } else {
          if (docs) {
           mastersend(docs.to, pwd, function(err,resp) {
             if (err) { 
               res.send('MASTER SEND ERR');
             } else {
                if (resp.length == 64) {
                  Usertx.findOneAndUpdate({to: to, status: 'send'}, {status: 'sending', tx: resp}, function(err, docs) {
                    if (err) {
                      res.send(err);
                    } else {
                    res.send('OK');
                    }
                  });
                }
             }
           });
         } else {
          res.send('DOCS ERR '+docs);
         }
        }
      });
       } else {
         masteratts++;
         res.send('PASSWD');
       }
     }
    });
  } else {
    res.send('LOCKDOWN');
    console.log('LOCKDOWN MODE - 5 incorrect master send requests at ./mastersend/:pwd/:id -- Reboot service');
  }
});

Usertx.find({status: 'send'}, function (err, docs) {
  for (var i = 0; i < docs.length; i++) {
    var to = docs[i].to;
    fs.readFile('/home/node/keys/send.key', 'utf8', function (err, data) {
      if (err)  {
          res.send('KEY ERROR '+err);
      } else {
        var key = data.replace("\n", "").replace("\r", "").replace(" ", "");
        mastersend(to, key, function(err, resp) {
          if (resp.length == 64) {
          Usertx.findOneAndUpdate({to: to}, {status: 'sending', tx: resp}, function(err, docs) {
            if (err) throw (err);

          });
        }
        }); 
      }
      });
    }
});

function mastersend(to, pwd, cb) {
  fs.readFile('/home/node/keys/send.key', 'utf8', function (err, data) {
    if (err) throw (err);
    var key = data.replace("\n", "").replace("\r", "").replace(" ", "");
    if (pwd == key) {
      Usertx.findOne({to: to, status: 'send'}, function (err, docs) {
        if (err) console.log('MASTERSEND USER TX DB ERR ' + err);
        if (docs) {
        var amount = Number(docs.amount);
        var to = docs.to;
        console.log('attempting to send '+amount+' to '+to);
          sendtoaddress(to, amount, function(err, resp) {
            if (err) {
              console.log('VAULT ERR: '+ err);
              cb(err,resp);  
            } else {
            console.log('VAULT RESPONCE: ' + resp);
            checktx(resp);
            Usertx.findOneAndUpdate({to: to}, {status: 'sent', tx: resp, confirmations: 0}, function(err, docs) {
                if (err) throw (err);
                  cb(err,resp);

              });
            }
          });
        } else {
          console.log('MASTERSEND DOCS ERR ' +docs)
        }
      });
    }
  });
}



app.get('/backupwallet', function(req, res, next){
  backup(function(result) {
    res.send(result);
  });
});

// Login
app.get('/logout', function(req, res) {
  res.clearCookie('key');
  res.writeHead(302, {location: '/'});
  res.end();
});
app.get('/login/:username/:password', function(req, res) {
      // Get username and password variables
      var password = decodeURI(req.param('password', null));
      var username = decodeURI(req.param('username', null));
      //console.log('login request recieved: ' + username + ':' + password);
          // Check if this username is in the userfilewall
          Userfirewall.count({username: username}, function(err, c){
            if (err) throw (err)
            // If this user has less than 5 failed login attempts in the past hour
            if (c < 5) {
              // If the username and password exist
              if (username && password) {
                // Find the user in the database
                User.findOne({ username: username }, function(err, user) {
                  if (err) throw err;
                  // If user exits
                  if (user) {
                   // Test the password
                    user.comparePassword(password, function(isMatch, err) {
                      if (err)  { throw (err); } else {
                        // On success
                        if (isMatch == true) {
                          // Generate a signature
                          var signature = randomString(32, 'HowQuicklyDaftJumpingZebrasVex');
                          // Add it into a secured cookie
                          res.cookie('key', signature, { maxAge: 3600000, path: '/', secure: true });
                          // Add the username and signature to the database
                          var userKey = new Activeusers({
                            key: signature,
                            user: username,
                            createdAt: date
                          });
                          userKey.save(function(err) {
                             if (err) { throw (err) }
                            });
                           res.send("OK");
                        } else if (isMatch == false) {
                          // On error
                          res.send("Invalid username or password.");
                          // Log the failed request
                          var loginRequest = new Userfirewall({
                            username: username,
                            createdAt: date
                          });
                         loginRequest.save(function(err) {
                           if (err) { throw (err) }
                          });
                        }
                    }
                    });
                } else {
                  res.send("Invalid username or password.");
                }
                });
              }
            } else {
              // Block brute force
              res.send("Too many requests.");
            }
          });
});app.get('/login', function(req, res){
  res.send('Let me explain: /login/{username}/{password}');
});

// Add a user
app.get('/adduser/:username/:email/:password', function(req, res, next){
if (signupsopen == true) {

  // Check if  the username is taken
  var query  = User.where({ username: req.params.username });
  query.findOne(function (err, user) {
    if (err) throw (err);
    if (user) { res.send(req.params.username); } else {

  // Create a new bitcoin address
    createAddress(req.params.username, function(err, data) {
      if (err) throw (err);
       rclient.set(req.params.username, 0);
      //console.log(data);
      if (data != null) {
  // create a user a new user
    var newUser = new User({
        username: req.params.username,
        email: req.params.email,
        verifiedemail: false,
        password: req.params.password,
        btc: data
    });
  // save user to database
  newUser.save(function(err) {
    if (err) {
      res.send(err);
    // Something goes wrong
      switch(err.code){
        case 11000: // Username exists
        res.send('Email or Username Taken');
      break
        default:
        res.send('Database Error');
        }
    } else {
      res.send('OK');
    }
    });
    } else {
      res.send('Bitcoin Error')
    }
  });
  }
});
} else {
  res.send('Signups are not open');
}
});
app.get('/adduser', function(req, res, next){
  res.send('Let me explain /adduser/{username}/{email}/{password}');
});
app.get('/signupsopen', function(req, res, next){
  if (signupsopen == true) {
    res.send('OK');
  } else {
    res.send('NO');
  }
});

// Load subpages
app.get('/account/', function(req, res, next){
  //res.send(req.params.id);
  res.sendfile('views/a.html');
});
app.get('/finance/', function(req, res, next){
  //res.send(req.params.id);
  res.sendfile('views/f.html');
});

// function wasteland */

function checkcookie(socket, next) {
var result = null;
  //Parse existing cookies
  if (socket.handshake.headers.cookie) {
    var cookie = socket.handshake.headers.cookie;
    var cookieObj = {};
    var cookieArr = cookie.split(';');
    for (index = 0; index < cookieArr.length; ++index) {
      var cookieKV = cookieArr[index];
      cookieKV = cookieKV.trim();
      var cookieKVArr = cookieKV.split('=');
      cookieObj[cookieKVArr[0]] = cookieKVArr[1];
      //console.log(cookieObj.key);
    }
    if (cookieObj.key) {
      Activeusers.find({ key: cookieObj.key }, function (err, docs) {
        if (err) { throw (err) } else {
        docs = docs[0];
        // User authorized
        if (docs) {
          //console.log(docs.user + ":" + docs.key);
          next(docs.user, true);
            //console.log(myName+':'+myNumber+' connected');
          // Log the connection
          var pageload = new Pageviews({
            ip: socket.handshake.address.address,
            time: time,
            handle: myName
          });
          pageload.save(function (err) {
            if (err) throw (err);
          });
        } else {
          next('Guest', false);
        }
        }
      });
      }
    } // if cookie
}



// Proto

    //loginfo(); // Bitcoin info logger

    // socket = users[tradeuser];
    // if (outcome == 'Win') {
    // socket.emit('alertuser', {
    //  color: 'green',
    //   message: 'You won '+amount+''
    // });
    // } else if (outcome == 'Lose') {
    // socket.emit('alertuser', {
    //  color: 'red',
    //   message: 'You lost '+amount+''
    // });
    // } else if (outcome == 'Tie') {
    // socket.emit('alertuser', {
    //  color: 'green',
    //   message: 'Push for '+amount+''
    // });
    // }


function round(num, places) {
  if (!places) places = 0;
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function symbolswitch(symbol){
      // switch out illigal characters
    switch (symbol) {
      case 'DOW':
        symbol = '^DJI'
      break;
      case 'OIL':
        symbol = 'CLJ14.NYM'
      break;
      case 'GOLD':
        symbol = 'GCJ14.CMX'
      break;
      case 'SP500':
        symbol = '^GSPC'
      break;
      case 'NASDAQ':
        symbol = '^IXIC'
      break;
      case 'SILVER':
        symbol = 'SLV'
      break;
    }
  return symbol;
}

function processTrade(trades) {
  console.log('Processed trades '+date.toString());
  //console.log(trades);

  var processedu = new Array();
  for (var index = 0; index < trades.length; ++index) {
    var trade = trades[index];
    //console.log(trade.user)

    processedu.push(trade.user);

    if (!x[trade.user]) x[trade.user] = 0;
    if (!y[trade.user]) y[trade.user] = 0;
    if (!z[trade.user]) z[trade.user] = 0;

    if (trade.outcome == 'Win') x[trade.user] = (+x[trade.user] + (+trade.amount+(trade.amount*trade.offer)));
    if (trade.outcome == 'Tie') y[trade.user] = (+y[trade.user] + trade.amount);
    if (trade.outcome == 'Lose') z[trade.user] = (+z[trade.user] + (+trade.amount+(trade.amount*trade.offer)));
    // socket.emit('tradeoutcome', { 
    //   x: x[trade.user],
    //   y: y[trade.user],
    //   z: z[trade.user]
    // });
  }
  console.log(processedu);
  for (var index = 0; index < processedu.length; ++index) {
    var user = processedu[index];

    console.log('Trade outcome for ' + user + ' Won:' + x[user] + ' Tied:' + y[user] + ' Lost:' + z[user]);
  }
}




var chartdata = new Array();
var lag = 0;
function getPrice(symbol, force, callback) {
  var err = 0;var data = null;

  if (symbol == 'BTCUSD') {
  var options = {
    host: 'api.bitcoinaverage.com',
    port: 80,
    path: '/ticker/USD/last'
  };
  http.get(options, function(resp){
    var decoder = new StringDecoder('utf8');
    resp.on('data', function(chunk){
      chunk = decoder.write(chunk);
      //console.log('BTC'+chunk);
      var data = chunk;
      if(parseInt(data, 10) > 0) {
      updatePrice(data, force, symbol);
      price[symbol] = data;
      }else {
        lag = lag+2;
      }
    });
  }).on("error", function(e){
    console.log("Got "+options.host+" error: " + e.message);
  });
  } else if (symbol == 'BTCCNY') {
  var options = {
    host: 'api.bitcoinaverage.com',
    port: 80,
    path: '/ticker/CNY/last'
  };
  http.get(options, function(resp){
    var decoder = new StringDecoder('utf8');
    resp.on('data', function(chunk){
      chunk = decoder.write(chunk);
      //console.log('BTCCNY:'+chunk);
      var data = chunk;
      if(parseInt(data, 10) > 0) {
      updatePrice(data, force, symbol);
      price[symbol] = data;
      }else {
        lag = lag+2;
      }
    });
  }).on("error", function(e){
    console.log("Got "+options.host+" error: " + e.message);
  }); // if symbol is a currency, we run it through for the exchange rate
  } else if (symbol == 'EURUSD' || symbol == 'GBPUSD' || symbol == 'USDCNY') {
  var options = {
    host: 'download.finance.yahoo.com',
    port: 80,
    path: '/d/quotes.csv?s='+symbol+'=X&f=sl1d1t1c1ohgv&e=.csv'
  };
  http.get(options, function(resp){
    var decoder = new StringDecoder('utf8');
    resp.on('data', function(chunk){
      chunk = decoder.write(chunk);
      data = chunk.split(',');
      data = data[1];
      //console.log(symbol+':'+data);
      if(parseInt(data, 10) > 0) { // is this data even numeric?
        updatePrice(data, force, symbol);
        price[symbol] = data;
      }else {
        lag = lag+2;
      }
    });
  }).on("error", function(e){
    console.log("Got "+options.host+" error: " + e.message);
    err++;
  });
  // if symbol is a stock, run it through for the price
  }else {
  var options = {
    host: 'download.finance.yahoo.com',
    port: 80,
    path: '/d/quotes.csv?s='+symbol+'&f=sl1d1t1c1ohgv&e=.csv'
  };
  http.get(options, function(resp){
    var decoder = new StringDecoder('utf8');
    resp.on('data', function(chunk){
      chunk = decoder.write(chunk);
      data = chunk.split(',');
      data = data[1];

      if(parseInt(data, 10) > 0) { // is this data even numeric?
        updatePrice(data, force, symbol);
        price[symbol] = data;
      }else {
        lag = lag+5;
      }
    });
  }).on("error", function(e){
    console.log("Got "+options.host+" error: " + e.message);
    err++;
  });
  }// jump over third-party gates
}

// bitcoin layer
var  bitcoin = require('bitcoin')
  ,fs = require('fs')
  ,mongoose = require('mongoose')
  ,User = require('user-model');
var client = null;
var gclient = null;
function Bitcoinconnect(next) {
  fs.readFile('/home/node/keys/bitcoin.id', 'utf8', function (err,data) {
    if (err) throw (err);
    var id = data.replace("\n", "").replace("\r", "");
      fs.readFile('/home/node/keys/bitcoin.key', 'utf8', function (err,data) {
        if (err) throw (err);
      var key = data.replace("\n", "").replace("\r", "");
        fs.readFile('/home/node/keys/bitcoin.host', 'utf8', function (err,data) {
          if (err) throw (err);

          var host = data.replace("\n", "").replace("\r", "");
          fs.readFile('/home/node/keys/bitcoin.port', 'utf8', function (err,data) {
            if (err) throw (err);
            var port = data.replace("\n", "").replace("\r", "");
          var client = new bitcoin.Client({
            host: host,
            port: port,
            user: id,
            pass: key,
            timeout: 5000
          });
          //console.log(host+':'+port);
          next(client);
        });
        });
    });
  });
}

Bitcoinconnect(function(client) {
  // After connection
  gclient = client;
  loginfo();
  //dumptoLocal();
  //syncLocal;
  //syncRemote();
// sendfrom('myaccount', '1A5BWZULifJVtfomBtFKRWzDxg9MVSWkjG', '1', function(err, txid) {
//   console.log(txid);
// });
  displayAccounts(function (err, info) {
    console.log(info);
  })
});
// dump(1, 'liam');
//console.log(balances);

function loginfo(){
  gclient.cmd('getinfo', function(err, info){
  if (err) throw (err);
    console.log('Bitcoin loaded ', info);
    return info;
  });
}

function backup(cb){
  gclient.cmd('backupwallet', '/mnt/sdb1/', function(err, info){
  if (err) throw (err);
    console.log('Backedup Remote Wallet');
    cb(info);
  });
}

function displayAccounts(cb) {
    gclient.cmd('listreceivedbyaccount', function(err, info){
      if (err) throw (err);
      //console.log(info);
      cb(err, info);
  });
}function serverBalance(cb) {
    gclient.cmd('getbalance', function(err, info){
      if (err) throw (err);
      //console.log(info);
      cb(err, info);
  });
}

function dumptoLocal(cb) {
  gclient.cmd('listreceivedbyaddress', 0, true, function(err, info){
  if (err) throw (err);
    var entries = new Array();
    var accounts = new Array();
    info.forEach(function(entry) {
      var amount = (+entry.amount*1000);
      accounts.push(entry.account);
      if (!entries[entry.account]) entries[entry.account] = 0;
      entries[entry.account] = (+entries[entry.account]+amount);
    });
    accounts.forEach(function(account) {
      rclient.set(account,entries[account]);
    });
      var action = "Dumped bitcoin wallets to local.";
      rclient.set('last',action)
      if (cb) cb();
  });
}

function syncLocal(cb) {
  gclient.cmd('listreceivedbyaddress', 0, true, function(err, info){
  if (err) throw (err);
    info.forEach(function(entry) {
        var amount = (+entry.amount*1000);
        rclient.get(user.username, function (err,register) {
          if (amount > register) {
            var difference = amount - register;
            rclient.set(entry.account, amount);
          } else if (amount < register) {
            var difference = register - amount;
            rclient.set(entry.account, amount);
          }
        });
    });
      var action = "synclocal";
      rclient.set('last',action)
      if (cb) cb();
  });
}

function addressbalance(account, cb) {
  var confirmations = 1;
  gclient.cmd('getbalance', account, confirmations, function(err, balance, resHeaders) {
    cb(err, balance);
  });
}

function chainuserbalance(username, cb) {
  User.findOne({ username: username }, function(err, user) {
    if (err) throw err;
    if (user != null){
    gclient.cmd('getbalance', user.username, function(err, balance, resHeaders) {
      //console.log(err) // Crunk, undefined, null
      //console.log(resHeaders) // Crunk, undefined, null
      balance = balance.toFixed(8);
      //console.log(user.username + ':' + balance); // Crunk, undefined, null
      cb(err, balance);
    });
    }
  });

}

function listtx(username, cb) {
  // User.findOne({ username: username }, function(err, user) {
  //   if (err) throw err;
  //   if (user != null) {
  //   gclient.cmd('listtransactions', user.username, 1000, function(err, data, resHeaders) {
  //     if (err) throw (err);
  //     //console.log(resHeaders);
  //     //console.log(data);
  //     if (data) cb(err, data);
  //   });
  //   }
  // });

  Usertx.find({ username: username }, function (err, docs) { 
    if (err) throw (err);
    cb(err, docs);
  })
}

function createAddress(label, cb) {
  gclient.cmd('getnewaddress', label, function(err, add, resHeaders) {
    if (err) throw (err);
    cb(err, add);
  });
}

function listreceivedbyaddress(cb) {
  gclient.cmd('listreceivedbyaddress', function(err, result, resHeaders) {
    if (err) throw (err);
      //console.log(result);
      cb(err, result);
  });
}


function dumptobank(cb) {
  gclient.cmd('listreceivedbyaddress', function(err, result, resHeaders) {
    if (err) throw (err);
      //console.log('User Balances:');
      for (var i = 0; i < result.length; i++) {
        var acc = result[i];
        if(acc.account != 'myaccount' && acc.confirmations > 3 & acc.amount > 0) {
          console.log(acc.account + ':' + acc.amount);
            gclient.cmd('sendfrom', acc.account, '1A5BWZULifJVtfomBtFKRWzDxg9MVSWkjG', acc.amount, function(err, result, resHeaders) {
              if (err) cb(err);
              console.log(result);
            });
        }
      }
  });
}


function sendfrom(from, to, amount, cb) {
  gclient.cmd('sendfrom', from, to, amount, function(err, txid, resHeaders) {
    cb(err, txid);
  });
}
function sendtoaddress(to, amount, cb) {
  gclient.cmd('sendtoaddress', to, amount, function(err, txid, resHeaders) {
    cb(err, txid);
  });
}

function move(from, to, amount, cb) {
  amount = (+amount/1000);
  gclient.cmd('move', from, to, amount, function(err, result, resHeaders) {
    cb(err, result);
  });
}

// function bank(from, amount, cb) {
//   amount = (+amount / 1000);
//   var to = "198px1RAx3NE4u8mXAaqWqmHN2DyRxeMeF";
//   gclient.cmd('sendfrom', from, to, amount, function(err, result, resHeaders) {
//     if (err) throw (err);
//     cb(result);
//   });
// }



function syncRemote(cb){

      User.find({ }, function (err, data) {
        if (err) throw (err);
        data.forEach(function(user) {
          rclient.get(user.username, function (err,register) {
            if (err) throw (err);
              chainuserbalance(user.username, function (err, balance) {
                //console.log(balance);
                if (err) throw (err)
                  if (balance != register) {
                    // Sync the register and balances for each user
                    //if (balance > register) rclient.set(user.username, balance);
                    if (register < balance) {
                      var amount = (+balance - register);
                      collectbank(amount, user.username);
                    }

                  }
              });
          });
        });
      });

}


function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}
// Function to add custom formats to dates in milliseconds
Date.prototype.customFormat = function(formatString){
    var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
    var dateObject = this;
    YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
    MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
    MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
    DD = (D=dateObject.getDate())<10?('0'+D):D;
    DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObject.getDay()]).substring(0,3);
    th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
    formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

    h=(hhh=dateObject.getHours());
    if (h==0) h=24;
    if (h>12) h-=12;
    hh = h<10?('0'+h):h;
    AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
    mm=(m=dateObject.getMinutes())<10?('0'+m):m;
    ss=(s=dateObject.getSeconds())<10?('0'+s):s;
    return formatString.replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
}
