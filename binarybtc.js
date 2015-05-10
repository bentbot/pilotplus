var port = 8080
  , fs = require('fs')
  , url = require('url')
  , path = require('path')
  , http = require('http')
  , nowjs = require('now')
  , ejs = require('ejs')
  , https = require('https')
  , express = require('express')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , favicon = require('serve-favicon')
  , session = require('express-session')
  , servefavicon = require('serve-favicon')
  , mongoose = require('mongoose')
  , redis = require('redis')
  , passport = require('passport')
  , Keygrip = require('keygrip')
  , bson = require('bson')
  , async = require('async')
  , LocalStrategy = require('passport-local').Strategy
  , StringDecoder = require('string_decoder').StringDecoder
  , irc = require('irc')
  , authy = require('authy-node')
  , bcrypt = require('bcrypt')
  , nodemailer = require('nodemailer')
  , crypto = require('crypto')
  , keys = require('./keys.json')

keys.ssl.lock = { 
  "ca": fs.readFileSync(JSON.stringify(keys.ssl.ca).split('"')[1], 'utf8'),
  "key": fs.readFileSync(JSON.stringify(keys.ssl.key).split('"')[1], 'utf8'),
  "cert": fs.readFileSync(JSON.stringify(keys.ssl.cert).split('"')[1], 'utf8')
}

var SALT_WORK_FACTOR = 10;

// User Framework

var UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    passwordlast: { type: String },
    email: { type: String, required: true },
    verifiedemail: { type: String, required: true },
    btc: { type: String, required: true },
    logins: { type: String },
    authy: {type: String }
});

UserSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});
UserSchema.pre('update', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) throw(err);
        cb(isMatch, err);
    });
};

var User = mongoose.model('users', UserSchema);

// IRC Listener
var messages = new Array();
var girclient = new irc.Client(keys.irc, 'root', {
  channels: ['#deetz'],
});
girclient.addListener('message#deetz', function (from, message) {
  messages.push({from:from, message:message});
  console.log(from+':'+message);
});
// Allow console to talk
var stdin = process.stdin;
//stdin.setRawMode( true );
stdin.resume();
stdin.setEncoding( 'utf8' );
var cons = '';
stdin.on( 'data', function( key ){
  // ctrl-c ( end of text )
  if ( key === '\u0003' ) {
    process.exit();
  }
  cons = cons + key;
  if ( key === '\u000D' ) {
    if (cons.charAt(0) == '/') {
      console.log(cons);
    } else {
      girclient.say('#deetz', cons);
      console.log('root:'+cons);
      cons = '';
    }
  }

});


// Global clock
var date = 0;
var time = 0;
var clock = setInterval(function() {
  time = new Date().getTime();
  date = new Date();
  checknextTrade(); // Check for the next trade
  io.sockets.emit('servertime', time);
}, 1000);


// Mailer

// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP");

function sendConfirmation(to, key, cb) {
var rand = Math.random();
var shasum = crypto.createHash('sha1');
shasum.update(key);
var confirm = shasum.digest('hex');
var contents = "<b style='color:hsl(28, 99%, 46%)'>Confirm your Account</b>" +
    "<p>"+
    "To confirm your account with us, please click on the following link: <br />"+
    "<a href='https://vbit.io/confirm/"+confirm+"/'>https://vbit.io/confirm/"+confirm+"</a>"+
    "</p>";
var mailOptions = {
    from: "vBit <mail@vbit.io>",
    to: to,
    subject: "Confirm your Account",
    text: "Please visit this address to confirm your account with us: http://vbit.io/confirm/"+confirm,
    html: contents
}
smtpTransport.sendMail(mailOptions, function(err, response){
    if(err){
        cb(err);
    }else{
        cb(err, responce);
    }
});
}

// Database connect
mongoose.connect(keys.mongo);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log('Database connected on port 27017');
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
var schema = new mongoose.Schema({ user: 'string', option: 'string', intl: 'string' });
var Userprefs = mongoose.model('userprefs', schema);
var schema = new mongoose.Schema({ key: 'string', email: 'string' });
var Userverify = mongoose.model('userverify', schema);
// Empty temporary database
Pageviews.remove({}, function(err) {
  if (err) console.log(err);
});

// Key value connect and money handling
rclient = redis.createClient();
rclient.auth(keys.redis);

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
authy.api.mode = 'production'
authy.api.token = keys.authy;

// Webserver

// Include SSL server.key and domain.crt from a safe place
var ca, file, files, fs, https, httpsOptions, httpsServer, requestHandler;


// Start secure webserver
//var keygrip = new Keygrip(["SEKRIT2", "SEKRIT1"]);
var app = module.exports = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(cookieParser('SEKRIT1'));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.text({ type: 'text/html' }));

// Create the server object
var server = https.createServer(keys.ssl.lock, app).listen(port, function(){
  console.log("Express server listening on port " + port);
});

// Start secure socket server
var io = require('socket.io').listen(3000, keys.ssl.lock);
io.set('log level', 1); // reduce logging


// Tradeserver Variables
              //Bitcoin and Crypto
var symbols = ['BTCUSD', 'LTCUSD', 'EURUSD', 'GBPUSD', 'CADUSD', 'AAPL', 'GOOG', 'CLM14.NYM', 'GCM14.CMX', '^SLVSY'];

var coin;
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

  // A good time to update transactions
  Usertx.find({}, function(err, docs) {
    async.each(docs,function (doc, callback) {
      checktx(doc);
      //console.log('checktx', doc)
    }, function (err) {
      if (err) throw(err);
    });
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
          console.log(symbol, ratio[symbol])

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
            // console.log('Total Call '+symbol+':'+totalcall.symbol);
            // console.log('Total Put '+symbol+':'+totalput.symbol);
            // console.log('Ratio '+symbol+' %'+ratio[symbol]);
            // console.log('Raw Difference: '+diff[symbol]);
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
    err.msg = 'Max Amount';
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

// Fill the ram with chart data on boot
Historicprices.find({}, function(err, docs) {
  if (err) throw (err)
  for (var i = 0; i<docs.length; i++){
    docs = docs[i];
    io.sockets.emit(docs.symbol, docs.chart);
    if (chart[docs.symbol]) {
      chartdata = chart[docs.symbol];
    } else {
      chartdata = [];
    }
    cartdata = docs.chart;
    chart[docs.symbol] = chartdata;
    console.log(docs.symbol);
  }
});
function valuesToArray(obj) {
  return Object.keys(obj).map(function (key) { return obj[key]; });
}

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

          var query = { symbol: symbol };
          Historicprices.findOneAndUpdate(query,
            { symbol: symbol, chart: chart[symbol] },
            { upsert: true}
          ,function(err) { // save or update chart data
            if (err) throw (err)
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


var lag = 0;
function checktx(doc){
  if (lag == 0) {

    var tx = doc.tx;

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
             lag = lag + 2;
             throw ('checktx json parse error from: '+e);
          }
          if(obj.data) {
         var confirmations = obj.data.confirmations;
          Usertx.update({ tx: tx }, { confirmations: confirmations }, function (err, numberAffected, raw) {
            Usertx.findOne({ tx: tx }, function (err, docs) {
              if (docs) {
                //console.log('Updating '+confirmations+' confirmations');
                if (confirmations > 0) poptx(tx);
              }
            });
          });
          }
        }
      });
    });
  } else {
    lag = lag - 1;
  }
}


var tradeupdater = setInterval(function() {
var symbols = ['BTCUSD', 'LTCUSD', 'EURUSD', 'GBPUSD', 'CADUSD', 'AAPL', 'GOOG', 'CLM14.NYM', 'GCM14.CMX', '^SLVSY'];

  async.each(symbols,function (symbol, callback) {
      getPrice(symbol, 1);
    }, function (err) {
      if (err) throw(err);
  });

}, 6753);


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
  var userxp = new Array();
  var userratio = new Array();
  var userpercentage = new Array();
  var userlevel = new Array();
  var userwins = new Array();
  var userlosses = new Array();
  var userties = new Array();
  io.sockets.emit('tradingopen', tradingopen); // Update trading status
  socket.on('page', function (data) {
    userpage[myName] = data.page;
    socket.emit('loadpage', {page: data.page, symbol: data.symbol, guest: data.guest});
  });


  socket.on('coinconnect', function (private) {

    fs.readFile('/home/ubuntu/keys/coin.key', 'utf8', function (err,data) {
      if (err) throw (err);
      var key = data.replace("\n", "").replace("\r", "");

      if (private.key == key) {
        var coin = socket;
        coin.emit('coinconnection', {status: 'OK', date: date });

        coin.on('heartbeat', function(beat) {
          console.log(beat);
          setTimeout(function() {
            coin.emit('heatbeat', { host: 'vbit.io', time: time });
          }, 500);
        });

      } else {
        socket.emit('coinconnection', {status: 'KEY', date: date });
      }

    });

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
      userxp[myName] = 0;
      userratio[myName] = 0;
      userpercentage[myName] = 0;
      userlevel[myName] = 0;
      userwins[myName] = 0;
      userlosses[myName] = 0;
      userties[myName] = 0;
      var rtotal = 0;

    Historictrades.find({ user: myName }, function (err, docs) {
      if (err) throw (err)
      for (var i; docs.length > i; i++) {
        doc = docs[i];
        if (doc.outcome == 'Win') {
          userxp[myName] = (+userxp[myName] + 20);
          userwins[myName]++;
        } if (doc.outcome == 'Tie') {
          userxp[myName] = (+userxp[myName] + 10);
          userties[myName]++;
        } if (doc.outcome == 'Lose') {
          userxp[myName] = (+userxp[myName] + 0);
          userlosses[myName]++;
        }
      }

      rtotal = (+userlosses[myName]+userwins[myName]+userties[myName]);
      userpercentage[myName] = round(Number(userwins[myName]) / Number(rtotal) * 100);
      userratio[myName] = userwins[myName]+':'+userlosses[myName];

      userlevel[myName] = 0;

    });

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
          socket.emit('hello', { hello: myName, id: myNumber, email: docx.email, verified: docx.verifiedemail, dualfactor: dualFactor[myName], ratio: userratio[myName], percentage: userpercentage[myName], xp: userxp[myName], level: userlevel[myName] });
        });
    } else {
      User.findOne({ username: myName }, function (err, docx) {
      socket.emit('hello', { hello: myName, id: myNumber, email: docx.email, verified: false, dualfactor: false, ratio: userratio[myName], percentage: userpercentage[myName], xp: userxp[myName], level: userlevel[myName] });
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
      socket.emit('alertuser', {message: text, trinket: 'Bitcoin', colour: colour});
    });
  }
  function emitsend(tx) {
    Usertx.findOne({tx: tx}, function(err, docs){
      if (err) throw (err)
      var text = 'A payment of <i class="fa fa-bitcoin">'+docs.amount+' has been queued for sending.';
      var colour = 'orange';
      socket.emit('alertuser', {message: text, trinket: 'Bitcoin', colour: colour});
    });
  }
  function emitsent(tx) {
    Usertx.findOne({tx: tx}, function(err, docs){
      if (err) throw (err)
      var text = '<i class="fa fa-bitcoin">'+docs.amount+' has been delivered to .';
      var colour = 'blue';
      socket.emit('alertuser', {message: text, trinket: 'Bitcoin', colour: colour});
    });
  }

 // Emit trade objects
  io.sockets.emit('totalcall', call);
  io.sockets.emit('totalput', put);
  //io.sockets.emit('option', symbol);
  io.sockets.emit('offer', offer);

  // Protochat
  fs.readFile('/home/ubuntu/keys/irc.host', 'utf8', function (err,data) {
  if (err) throw (err)
  var host = data.replace("\n", "").replace("\r", "");
  var name = myName;
    var irclient = new irc.Client(host, name, {
      channels: ['#deetz'],
    });
  irclient.addListener('message#deetz', function (from, message) {
    if (from != myName) socket.emit('chat', {from:from, message:message});
  });
  socket.on('chat', function (message) {
    if (myName == 'crunk') {
    irclient.say('#deetz', message);
    } else {
    irclient.say('#deetz', message);
    }
  });
  socket.on('message', function (data) {
    irclient.say(data.user, data.message);
  });
  socket.on('disconnect', function () {
    irclient.disconnect('disconnected');
  });
});


// User disconnects
  socket.on('disconnect', function () {
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
                  time: txtime
                });

                newTx.save(function(err) {
                  if (err) throw (err);
                  //checktx(tx);
                  res.send('OK');
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


// var lag = 0;
// txchecker = new Array();
// function checktx(tx){
//   txchecker[tx] = setInterval(function() {
//     if (lag == 0) {
//     var options = {
//       host: 'api.biteasy.com',
//       path: '/blockchain/v1/transactions/'+tx+''
//     };
//     https.get(options, function(resp){
//       var decoder = new StringDecoder('utf8');
//       resp.on('data', function(chunk){
//         if (chunk) {
//           chunk = decoder.write(chunk);
//           try{
//               var obj = JSON.parse(chunk);
//           }catch(e){
//              lag = lag + 2;
//              throw ('checktx json parse error from: '+e);
//           }
//           if(obj.data) {
//          var confirmations = obj.data.confirmations;
//           Usertx.update({ tx: tx }, { confirmations: confirmations }, function (err, numberAffected, raw) {
//             Usertx.findOne({ tx: tx }, function (err, docs) {
//               if (docs) {
//                 console.log('Updating '+confirmations+' confirmations');
//                 if (confirmations > 0) poptx(tx);
//                 if (confirmations > 10) clearInterval(txchecker[tx]);
//               }
//             });
//           });
//           }
//         }
//       });
//     });
//   } else {
//     lag = lag - 1;
//   }
//   },4444);
// }

function poptx(tx){
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
app.get('/lastpasschange/:user', function(req, res, next){
  var un = req.params.user;
  var query  = User.where({ username: un });
  query.findOne(function (err, user) {
    if (err) throw (err);
    if (user && user.passwordlast) {
      res.send(user.passwordlast);
    } else {
      res.send('0');
    }
  });
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
              res.send('Error');
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
              }
            }
          });
      }
      });
    }
  });
});
app.get('/sendout/:usr/:add/:am/:pass', function(req, res, next){
  var usr = req.params.usr;
  var amount = (+req.params.am/1000);
  var mamount = req.params.am;
  var to = req.params.add;
  var password = req.params.pass;
  var from = 'myaccount';

  User.findOne({ username: usr }, function(err, user) {
    if (err) {
      res.send('DB Error');
    } else {
      user.comparePassword(password, function(isMatch, err) {
        if (err)  { res.send('Pass'); } else {
        if (isMatch == true) {
          rclient.get(user.username,function (err, userbal) {
            if (err) {
              res.send('Error');
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
              }
            }
          });
        }
      }
  });
  }
  });
});



app.get('/verifyemail/:email', function(req, res, next) {
  var uemail = req.param('email', null);
  var key = randomString(32, 'HowQuicklyDaftJumpingZebrasVex');

  var query = { email: uemail };
  Userverify.findOneAndUpdate(query,
    { email: uemail, key: key },
    { upsert: true }
  ,function(err) {
    if (err) res.send('NO');
      sendConfirmation(uemail, key, function(err, resp) {
        if (err) res.send('NO');
        res.send('OK');
      });
  });
});
  app.get('/confirm/:key', function(req, res, next) {
  var key = req.param('key', null);
  Userverify.findOne({key: key}, function(err, docs) {
    if (err) { res.send('NO'); } else {
      if (docs) {
        Userverify.findOne({key: key}, function (err, docs) {
          if (err) { res.send('NO'); } else {
            user.findOneAndUpdate({username: docs.username}, {verifiedemail: true}, function (err, result) {
              if (err) res.send('NO');
              Userverify.remove({key: key}, function (err) {
                if (err) res.send('NO');
                res.send('OK');
              });


            });
          }
        });
      }
    }
  });
});




// Functions for master cash outputs
var masteratts = 0;

app.get('/mastersend/:pwd/:to', function(req, res, next) {
  if (masteratts < 5) {
    var pwd = req.param('pwd', null);
    var to = req.param('to', null);
    fs.readFile('/home/ubuntu/keys/send.key', 'utf8', function (err, data) {
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
    fs.readFile('/home/ubuntu/keys/send.key', 'utf8', function (err, data) {
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
  fs.readFile('/home/ubuntu/keys/send.key', 'utf8', function (err, data) {
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


// User prefs
app.get('/userprefs/:user/:option/:intl', function(req, res, next){
  var user = decodeURI(req.param('user', null));
  var option = decodeURI(req.param('option', null));
  var intl = decodeURI(req.param('intl', null));

  var query = { user: user };
  userprefs.findOneAndUpdate(query,
    { user: user, option: option, inil: initl },
    { upsert: true}
  ,function(err) { // save or update chart data
    if (err) res.send(err)
    res.send('OK');
  });


});

// Backup wallet to local USB drive
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
switch (req.params.username) {
  case 'root':
    res.send('Bad Username');
    break;
  case 'admin':
    res.send('Bad Username');
    break;
  case 'sudo':
    res.send('Bad Username');
    break;
  case 'server':
    res.send('Bad Username');
    break;
  case 'mod':
    res.send('Bad Username');
    break;
  case 'vbit':
    res.send('Bad Username');
    break;
  case 'vbit.io':
    res.send('Bad Username');
    break;
  default:

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
      console.log('New User '+req.params.username);
    }
    });
    } else {
      res.send('Bitcoin Error');
    }
  });
  }
});
}
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
// Change a pass
app.get('/newpassword/:username/:currentpassword/:newpassword', function(req, res) {
      // Get username and password variables
      var password = decodeURI(req.param('newpassword', null));
      var currentpassword = decodeURI(req.param('currentpassword', null));
      var username = decodeURI(req.param('username', null));
      //console.log('login request recieved: ' + username + ':' + password);
          // Check if this username is in the userfilewall
          Userfirewall.count({username: username}, function(err, c){
            if (err) throw (err)
            // If this user has less than 5 failed login attempts in the past hour
            if (c < 5) {
              // If the username and password exist
              if (username && currentpassword && password) {
                // Find the user in the database
                User.findOne({ username: username }, function(err, user) {
                  if (err) throw err;
                  // If user exits
                  if (user) {
                   // Test the password
                    user.comparePassword(currentpassword, function(isMatch, err) {
                      if (err)  { throw (err); } else {
                        if (password != currentpassword) {
                        // On success
                        if (isMatch == true) {
                          bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
                              if (err) throw(err);
                              // hash the password using our new salt
                              bcrypt.hash(password, salt, function(err, hash) {
                                  if (err) throw(err);
                                  // override the cleartext password with the hashed one
                                  password = hash;

                          var update = { password: password, passwordlast: time };
                          User.update({ username: user.username }, update, function(err) {
                             if (err) { throw (err) } else {
                              res.send("OK");
                             }
                            });
                               });
                          });
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
                      } else {
                        res.send('Incorrect password combination.');
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
        symbol = 'CLM14.NYM'
      break;
      case 'GOLD':
        symbol = 'GCM14.CMX'
      break;
      case 'SP500':
        symbol = '^GSPC'
      break;
      case 'NASDAQ':
        symbol = '^IXIC'
      break;
      case 'SILVER':
        symbol = '^SLVSY'
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
    if (!x[trade.user]) x[trade.user] = 0;
    if (!y[trade.user]) y[trade.user] = 0;
    if (!z[trade.user]) z[trade.user] = 0;

    if (trade.outcome == 'Win') x[trade.user] = (+x[trade.user] + (+trade.amount+(trade.amount*trade.offer)));
    if (trade.outcome == 'Tie') y[trade.user] = (+y[trade.user] + trade.amount);
    if (trade.outcome == 'Lose') z[trade.user] = (+z[trade.user] + trade.amount);

  }
  console.log(processedu);
  for (var index = 0; index < processedu.length; ++index) {
    var user = processedu[index];

    console.log('Trade outcome for ' + user + ' Won:' + x[user] + ' Tied:' + y[user] + ' Lost:' + z[user]);
  }
}


var chartdata = new Array();
var lag = 0;
var btceoptions = {
  host: 'btc-e.com',
  port: 443,
  path: '/api/2/btc_usd/ticker',
  method: 'GET',
  cert: keys.ssl.lock.cert,
  key: keys.ssl.lock.key,
  agent: false
};

function getPrice(symbol, force, callback) {
  var err = 0;var data = null;

  if (symbol == 'BTCUSD') {
  var symb = symbol.match(/.{3}/g);
  var symb = symbol.toLowerCase();
  symb = symb[0];

  var req = https.request(btceoptions, function(resp){
    var decoder = new StringDecoder('utf8');
    resp.on('data', function(chunk){
      chunk = decoder.write(chunk);
      //console.log(chunk)
      var data = chunk.split(',');
      var datas = data[7].split(':');
      data = datas[1];

      if(isNumber(data)) {
      data = Number(data);
      data.toFixed(2);
      //console.log(data);
      updatePrice(data, force, symbol);
      price[symbol] = data;
      }else {
        lag = lag+2;
      }
    });
  }).on("error", function(e){
    console.log("Got "+btceoptions.host+" error: " + e.message);
  }); // if symbol is a currency, we run it through for the exchange rate
  }  else if (symbol == 'LTCUSD') { // || symbol == 'NMCUSD' || symbol == 'NVCUSD' || symbol == 'NVCUSD'
  var symb = symbol.match(/.{3}/g);
  var symb = symbol.toLowerCase();
  symb = symb[0];

  var req = https.request(btceoptions, function(res){
    var decoder = new StringDecoder('utf8');
    res.on('data', function(chunk){
      chunk = decoder.write(chunk);
      //console.log(chunk)
      var data = chunk.split(',');
      var datas = data[7].split(':');
      data = datas[1];

      if(isNumber(data)) {
      data = Number(data);
      data.toFixed(2);
      //console.log(data);
      updatePrice(data, force, symbol);
      price[symbol] = data;
      }else {
        lag = lag+2;
      }
    });
  }).on("error", function(e){
    console.log("Got "+btceoptions.host+" error: " + e.message);
  }); // if symbol is a currency, we run it through for the exchange rate
  } else if (symbol == 'EURUSD' || symbol == 'GBPUSD' || symbol == 'CADUSD') {
  var options = {
    host: 'download.finance.yahoo.com',
    port: 80,
    path: '/d/quotes.csv?s='+symbol+'=X&f=sl1d1t1c1ohgv&e=.csv'
  };
  http.get(options, function(res){
    var decoder = new StringDecoder('utf8');
    res.on('data', function(chunk){
      chunk = decoder.write(chunk);
      data = chunk.split(',');
      data = data[1];
      //console.log(symbol+':'+data);
      if(isNumber(data)) { // is this data even numeric?
        //console.log(symbol+':'+data);
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
  http.get(options, function(res){
    var decoder = new StringDecoder('utf8');
    res.on('data', function(chunk){
      chunk = decoder.write(chunk);
      data = chunk.split(',');
      data = data[1];
      //console.log(symbol, data);
      if(isNumber(data)) { // is this data even numeric?
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

// Bitcoin Functions
function loginfo(){
  if (coin) {
    coin.emit('info');
    coin.on('info', function (data) {
      if (data.err) throw (data.err);
      console.log (data.info);
      cb(data.err, data.info);
    });
  } else {
    console.log('Could not make Bitcoin Connection');
    cb('Coin Connection');
  }
}

function backup(cb){
  if (coin) {
    coin.emit('backupwallet', { mount: '/mnt/sdb1/' });
    coin.on('backupwallet', function (data) {
      if (data.err) throw (data.err);
      console.log('Backing up remote Bitcoin Wallet...');
      console.log(data.info);
      cb(data.err, data.info);
    });
  } else {
    cb('Coin Connection');
  }
}

function displayAccounts(cb) {
    if (coin) {
    coin.emit('listreceivedbyaddress');
    coin.on('listreceivedbyaddress', function (data){
      if (data.err) throw (data.err);
      cb(data.err, data.result);
    });
  } else {
    cb('Coin Connection');
  }
}

function serverBalance(cb) {
  if (coin) {
    coin.emit('getbalance');
    coin.on('getbalance', function (data){
      if (data.err) throw (data.err);
      cb(data.err, data.balance);
    });
  } else {
    cb('Coin Connection');
  }
}

function syncLocal(cb) {
  if (coin) {
    coin.emit('listreceivedbyaddress');
    coin.on('listreceivedbyaddress', function(data) {
      if (data.err) throw (data.err);
        var info = data.info;
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
        rclient.set('last',action);
        if (cb) cb();
    });
  } else {
    cb('Coin Connection');
  }
}

function addressbalance(account, cb) {
  if(coin) {
    coin.emit('getbalance', { user: account, confirmations: 1 });
    coin.on('getbalance', function(data) {
     cb(data.err, data.balance);
   });
  } else {
    cb('Coin Connection');
  }
}

function chainuserbalance(username, cb) {
  if (coin) {
    User.findOne({ username: username }, function(err, user) {
      if (err) throw err;
      if (user != null){
        coin.emit('getbalance', { user: user.username, confirmations: 1 });
        coin.on('getbalance', function(data) {
          var balance = data.balance;
          balance = balance.toFixed(8);
          cb(data.err, balance);
        });
      }
    });
  } else {
    cb('Coin Connection');
  }
}

function listtx(username, cb) {
  Usertx.find({ username: username }, function (err, docs) {
    if (err) throw (err);
    cb(err, docs);
  })
}

function createAddress(label, cb) {
  if (coin) {
    coin.emit('getnewaddress', { label: label });
    coin.on('getnewaddress', function (data) {
      cb(data.err, data.address);
    });
  } else {
    cb('Coin Connection');
  }
}

function listreceivedbyaddress(cb) {
  if (coin) {
    coin.emit('listreceivedbyaddress');
    coin.on('listreceivedbyaddress', function (data) {
      cb(data.err, data.result);
    });
  } else {
    cb('Coin Connection');
  }
}


function sendfrom(from, to, amount, cb) {
  if (coin) {
    coin.emit('sendfrom', { from: from, to: to, amount: amount });
    coin.on('sendfrom', function (data) {
      cb(data.err, data.txid);
    });
  } else {
    cb('Coin Connection');
  }
}

function sendtoaddress(to, amount, cb) {
  if (coin) {
    coin.emit('sendtoaddress', { to: to, amount: amount });
    coin.on('sendtoaddress', function (data) {
      cb(data.err, data.txid);
    });
  } else {
    cb('Coin Connection');
  }
}

function move(from, to, amount, cb) {
  if (coin) {
    amount = (+amount/1000);
    coin.emit('move', { from: from, to: to, amount: amount });
    coin.on('move', function (data) {
      cb(data.err, data.result);
    });
  } else {
    cb('Coin Connection');
  }
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


function isNumber(num) {
  return (typeof num == 'string' || typeof num == 'number') && !isNaN(num - 0) && num !== '';
};

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

// comparer : function(currentElement)
Array.prototype.inArray = function(comparer) {
    for(var i=0; i < this.length; i++) {
        if(comparer(this[i])) return true;
    }
    return false;
};

// adds an element to the array if it does not already exist using a comparer
// function
Array.prototype.pushIfNotExist = function(element, comparer) {
    if (!this.inArray(comparer)) {
        this.push(element);
    }
};
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