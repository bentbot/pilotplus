var you = 1
  , fs = require('fs')
  , url = require('url')
  , path = require('path')
  , http = require('http')
  , nowjs = require('now')
  , jade = require('jade')
  , https = require('https')
  , sio = require('socket.io')
  , express = require('express')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , favicon = require('serve-favicon')
  , session = require('express-session')
  , servefavicon = require('serve-favicon')
  , ObjectManage = require('object-manage')
  , mongoose = require('mongoose')
  , redis = require('redis')
  , passport = require('passport')
  , Keygrip = require('keygrip')
  , bson = require('bson')
  , async = require('async')
  , striptags = require('striptags')
  , LocalStrategy = require('passport-local').Strategy
  , StringDecoder = require('string_decoder').StringDecoder
  , subdomain = require('wildcard-subdomains')
  , irc = require('irc')
  , authy = require('authy-node')
  , bcrypt = require('bcrypt')
  , nodemailer = require('nodemailer')
  , crypto = require('crypto')
  , requirejs = require('requirejs')
  , keys = require('./keys.json')
  , port = keys.webport;


// Stripe API
var stripe = require("stripe")(keys.stripe.secret);

// 2 Factor
authy.api.mode = 'production'
authy.api.token = keys.authy;

keys.ssl.lock = {
  "ca": fs.readFileSync(JSON.stringify(keys.ssl.ca).split('"')[1], 'utf8'),
  "key": fs.readFileSync(JSON.stringify(keys.ssl.key).split('"')[1], 'utf8'),
  "cert": fs.readFileSync(JSON.stringify(keys.ssl.cert).split('"')[1], 'utf8')
}

//****************//
// Functions Index
// 
//   70 | User Framework
//  270 | IRC Framework
//  314 | Clock
//  325 | Mailer
//  365 | Mongo Framework
//  410 | Redis Framework
//  475 | Web Service
//  512 | Trading
// 1080 | Charts
// 1250 | Socket.IO
// 1930 | Express
// 2560 | Sock API
//
//
//
//****************//
//****************//
// User Framework
//requirejs('./requirements/userframework.js');
//****************//
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var SALT_WORK_FACTOR = 10,
    mongoose = require('mongoose')

// User Framework

var UserSchema = new mongoose.Schema({
    username: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true },
    passwordlast: { type: String },
    email: { type: String, required: true, index: { unique: true } },
    verifiedemail: { type: String, required: true },
    btc: { type: String },
    currency: { type: String },
    logins: { type: String },
    authy: {type: String },
    ratio: {type: String },
    referral: {type: String },
    achievements: {type: String },
    percentage: {type: String },
    experience: {type: Number },
    level: {type: Number}
});

UserSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    //if (!User.isModified('password')) return next();

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

// Model the user
var User = mongoose.model('users', UserSchema);



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
      User.comparePassword(password, function(isMatch, err) {
           if (err) throw err;
           // return true or false
          return isMatch;
      });
    }
  });
}


function getUsers () {
   var userNames = [];
   for(var name in users) {
     if(users[name]) {
       userNames.push(name);
     }
   }
   return userNames;
}
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
          next(false);
        }
        }
      });
      }
    } // if cookie
}

User.count({ }, function (err, count) {
  if (err) throw(err);
  userNumber = (userNumber+count);
});






//****************//
// IRC Chat
//requirejs('./requirements/irc.js');
//****************//
// IRC Listener
var messages = new Array();

var girclient = new irc.Client(keys.irc.connection, 'root', {
  channels: [keys.irc.channel]
});
girclient.addListener('message'+keys.irc.channel, function (from, message) {
  
  messages.push({from:from, message:message});
  io.sockets.emit('messages', messages)
  
});
girclient.addListener('error', function(message) {
    console.log('error: ', message);
});
// girclient.say(keys.irc.channel, 'data.message');
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
      girclient.say(keys.irc.channel, cons);
      console.log('root:'+cons);
      cons = '';
    }
  }

});

//****************//
// Clock
//****************//
var date = 0;
var time = 0;
var clock = setInterval(function() {
  time = new Date().getTime();
  date = new Date();
  checknextTrade(); // Check for the next trade
  io.sockets.emit('servertime', time);
}, 1000);

//****************//
// Mailer
//requirejs('./requirements/mailer.js');
//****************//
function sendConfirmation(to, key, cb) {
  console.log(to);
  var confirm = key;
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: keys.mailer.user,
        pass: keys.mailer.password
    }
  });
  var contents = "<b style='color:hsl(28, 99%, 46%)'>Confirm your Account</b>" +
      "<p>"+
      "To confirm your account with us, please click on the following link: <br />"+
      "<a href='https://"+keys.site.domain+"/confirm/"+confirm+"/'>https://"+keys.site.domain+"/confirm/"+confirm+"</a>"+
      "</p>";
  var mailOptions = {
      from: keys.site.title+" <mail@"+keys.site.title+">",
      to: to,
      subject: "Confirm your Account",
      text: "Please visit this address to confirm your account with us: http://"+keys.site.title+"/confirm/"+confirm,
      html: contents
  }
  transporter.sendMail(mailOptions, function(err, responce){
      if (err) {
          cb(err);
      } else {
          cb(err, responce);
      }
  });
}

//****************//
// Mongo Framework
//requirejs('./requirements/mongoframework.js');
//****************//
// Database connect
mongoose.connect(keys.mongo);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  //console.log('Database connected on port 27017');
});

// Setup database schemas and models
var schema = new mongoose.Schema({ key: 'string', user: 'string', createdAt: { type: Date, expires: '10h' }});
var Activeusers = mongoose.model('activeusers', schema);
var schema = new mongoose.Schema({ username: 'string', createdAt: { type: Date, expires: keys.site.loginblock }});
var Userfirewall = mongoose.model('userfirewall', schema);
var schema = new mongoose.Schema({ ip: 'string', time: 'string', handle: 'string' });
var Pageviews = mongoose.model('pageviews', schema);
var schema = new mongoose.Schema({ symbol: 'string', price: 'string', offer: 'string', amount: 'string', direction: 'string', time: 'string', expires: 'string', user: 'string', currency: 'string' });
var Activetrades = mongoose.model('activetrades', schema);
var schema = new mongoose.Schema({ symbol: 'string', price: 'string', offer: 'string', amount: 'string', direction: 'string', timeplaced: 'string', time: 'string', finalprice: 'string', outcome: 'string', winnings: 'string', user: 'string', currency: 'string', outcome: 'string' });
var Historictrades = mongoose.model('historictrades', schema);
var schema = new mongoose.Schema({ symbol: 'string', price: 'string', time: 'string', createdAt: { type: Date, expires: '1h' } });
var Historicprices = mongoose.model('historicprices', schema);
var schema = new mongoose.Schema({ username: 'string', stripe: 'string', paypal: 'string' });
var Customers = mongoose.model('customers', schema);
var schema = new mongoose.Schema({ from: 'string', to: 'string', amount: 'string', currency: 'string',txid: 'string', time: 'string'});
var Sentpayments = mongoose.model('sentpayments', schema);
var schema = new mongoose.Schema({ option: 'string', setting: 'string'});
var Globalvars = mongoose.model('globalvars', schema);
var schema = new mongoose.Schema({ username: 'string', phone: 'string', id: 'string'});
var Userauth = mongoose.model('userauth', schema);
var schema = new mongoose.Schema({ direction: 'string', username: 'string', address: 'string', amount: 'string', status: 'string', confirmations: 'string', tx: 'string', to: 'string', time: 'string'});
var Usertx = mongoose.model('usertx', schema);
var schema = new mongoose.Schema({ user: 'string', preference: 'string', setting: 'string' });
var Userprefs = mongoose.model('userprefs', schema);
var schema = new mongoose.Schema({ key: 'string', email: 'string' });
var Userverify = mongoose.model('userverify', schema);

// Empty temporary database
Pageviews.remove({}, function(err) {
  if (err) console.log(err);
});


//****************//
// Redis Framework
//requirejs('./requirements/redisframework.js');
//****************//
var redis = require('redis')
// Key value connect and money handling
rclient = redis.createClient();
rclient.auth(keys.redis);

function pay(amount, tradeuser, currency, callback) {
  
  var errors = false;  
  
  if (!currency) currency = 'USD';
  if (amount > 0) {
    
    console.log('Paying '+amount+' '+currency+' to '+tradeuser);
    amount = Number(round(amount, 2));
    
    rclient.get('myaccount.'+currency, function(err, reply) {
      if (err) errors =+ err;
        var myaccount = Number(round(+reply-amount,2));
        rclient.set('myaccount'+'.'+currency, myaccount, function(err, reply) {
          if (err) errors =+ err;
          rclient.get(tradeuser+'.'+currency, function(err, reply) {
            if (err) errors =+ err;
            var updatedbal = Number(round(+reply+amount,2));
            console.log('Balance Update for '+tradeuser+': '+reply+' to '+updatedbal);
            rclient.set(tradeuser+'.'+currency, updatedbal, function(err, reply) {
              if (err) errors =+ err;
              callback(errors, amount, tradeuser, currency);
            });
          });
        });
    });
  }
}

function collectbank(amount, tradeuser, currency, cb) {

  if (amount > 0) {
    amount = round(amount, 6);
  }

  amount = round(amount, 6);
  rclient.get(tradeuser+'.'+currency, function(err, reply) {
    if (err) throw (err)
      var updatedbal = round(+reply-amount,6);
      rclient.set(tradeuser+'.'+currency, updatedbal, function(err, reply) {
        if (err) throw (err)
          rclient.get('myaccount'+'.'+currency, function(err, reply) {
          if (err) throw (err)
            var updatedbal = round(+reply+amount,6);
            rclient.set('myaccount'+'.'+currency, updatedbal, function(err, reply) {
              if (err) throw (err)
              if (cb) cb(amount, tradeuser, currency);
            });
          });
      });
  });
}




//****************//
// Web Service
//requirejs('./requirements/webservice.js');
//****************//
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




//****************//
// Trading
//requirejs('./requirements/webservice.js');
//****************//
// Tradeserver Variables
var currencies = new Array();
var symbols = new Array();
var ratio = {};
if ( keys.currencies && keys.symbols ) {
  async.each(keys.currencies, function (item) {
    currencies.push(item);
  });
  async.each(keys.symbols, function (item) {
    symbols.push(item);
    ratio[item.symbol] = 50;
  });

} else {
  console.log('Currencies & Symbols are not defined in keys.json');
}


var symbolUpdater = setInterval(function() {
  var items = new Array();
  symbols.forEach(function (symbol) {
    var item = {};
    // Show only new prices
    // Historicprices.find({ symbol: symbol.symbol }).where('time').gte(time-1800000).sort({ time: -1 }).exec(function (err, docs) {
    //   async.each( docs, function (doc) {
    //     if (symbol.symbol == 'USDJPY') console.log(doc.time, time);
    //   });
    // });
    item.name = symbol.name;
    item.symbol = symbol.symbol;
    item.type = symbol.type;
    item.price = price[symbol.symbol];
    items.push(item);
  });
  io.sockets.emit('symbols', items);
  io.sockets.emit('currencies', currencies);
}, 1000);


function symbolswitch(symbol){
      // modify characters 
        switch (symbol) {
          case '^DJI':
            symbol = 'DOW'
          break;
          case 'CLM15.NYM':
            symbol = 'OIL'
          break;
          case 'GCZ15.CMX':
            symbol = 'GOLD'
          break;
          case '^GSPC':
            symbol = 'SP500'
          break;
          case '^IXIC':
            symbol = 'NASDAQ'
          break;
          case '^SLVSY':
            symbol = 'SILVER'
          break;
        }
  return symbol;
}

var coin;
var bank;
var put = 0;
var call = 0;
var maxamount = keys.site.maxamount; // the max amount a user can set for any one trade
var maxoffset = keys.site.offset;
var cuttrading = keys.site.stoptrading; // seconds before trading where the user is locked out from adding a trade (zero to disable)
var offer = keys.site.offers.default;
var tradeevery = keys.site.tradeevery; // Defaut time in minutes before trading again
var userNumber = 1;
var trades = new Array();
var signupsopen = keys.site.allowsignup; // Allow signups?
var tradingopen = keys.site.allowtrading; // Allow trading? -proto
var lasttrade = 0;
var userbalance = {};
var diff = {};
var users = {};
var price = {};
var balance = {};
var calls = {};
var puts = {};
var totalcall = {};
var totalput = {};
var tradingnow = false;
var useraddress = {};
var payout = new Array();
var y = new Array();
var x = new Array();
var z = new Array();
var a = 0;


// Master trade function
//=trade if able

function trade() {

  var loopedtrades = new Array(), t = 0;

  if (tradingnow == false) {
    tradingnow = true;
    // Looped trades and incrementet
    // Get active trades
    Activetrades.find({ }, function (err, trades) {

      // For Loop
      trades.forEach( function (trade) {

        // Get the correct time cycle for this trade
        var cycle;
        for (var i = nexttrade.length - 1; i >= 0; i--) {
          if ( nexttrade[i].time == trade.expires ) {
            cycle = nexttrade[i];
          }
        };


        // Check if the cycle has ended
        if (cycle.seconds <= keys.site.stoptrading && cycle.seconds < 1) {
          // Check the direction and calculate the outcome
          var winnings = 0;
          if (trade.direction == 'Call'){
            if (trade.price > price[trade.symbol]) {
              trade.outcome = 'Lose'; //Loss
              // User loses call
            } else if (trade.price < price[trade.symbol]){
              trade.outcome = 'Win'; 
              // User wins trade
              winnings = Number(+trade.amount + (+trade.amount*trade.offer) ).toFixed(2);
              
            } else if (trade.price == price[trade.symbol]) {
              trade.outcome = 'Tie';
              if (keys.site.returntie) winnings = trade.amount;
            }
          } else if (trade.direction == 'Put'){
              if (trade.price < price[trade.symbol]) {
              trade.outcome = 'Lose';//Lose
              // User lost put
            } else if (trade.price > price[trade.symbol]){
              winnings = Number(+trade.amount + (+trade.amount*trade.offer) ).toFixed(2);
              trade.outcome = 'Win';
              //Update user balance and move winnings out of the bank
              
            } else if (trade.price == price[trade.symbol]) {
              trade.outcome = 'Tie';
              if (keys.site.returntie) winnings = trade.amount;
            } 
          }

          // Add money to a user currency object
          
          if (winnings > 0) {
            if ( payout[trade.user+'.'+trade.currency] > 0 ) {
              // Recalculate and set amount
              payout[trade.user+'.'+trade.currency] = Number( +Number(payout[trade.user+'.'+trade.currency]) + +Number(winnings) ).toFixed(2);
            } else {
              payout[trade.user+'.'+trade.currency] = Number(winnings).toFixed(2);
            }
          }

          var historictrade = {
            user: trade.user,
            symbol: trade.symbol,
            price: trade.price,
            direction: trade.direction,
            amount: trade.amount,
            offer: trade.offer,
            currency: trade.currency,
            timeplaced: trade.time,
            time: time,
            outcome: trade.outcome,
            finalprice: price[trade.symbol],
            winnings: winnings
          };

          // Store the trades in the db
          var dbhistorictrades = new Historictrades(historictrade);
          dbhistorictrades.save(function (err) { if (err) throw(err) });

          loopedtrades.push(historictrade);
          ratio[trade.symbol] = 50;

          Activetrades.remove({ _id: trade._id }, function(err) {
            if (err) throw(err);
          });
          
        }// timing cycle check

      });//foreach trade loop

          // Run graphical updates 
        if (loopedtrades.length > 0) cookTrades(loopedtrades);
    });//active trades

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
    lasttrade = time;
  } else {
    tradingnow = false;
  }
}

setInterval( function () {
  trade();
}, 500);


var x = new Array();
var y = new Array();
var z = new Array();

// Post trading notifications
function cookTrades(trades) {

  if (trades.length > 0) console.log('Traded '+date.toString());

  var xp = new Array();
  var currentlevel = new Array();
  var lastlevel = new Array();
  var nextlevel = new Array();

  // Findall 
    Historictrades.find({ user: trade.user }, function (err, historic) {
      if (err) throw (err);
      async.each(trades, function (trade) {
        User.findOne({ username: trade.user }, function (err, user) {
          if (err) throw (err);

          // Send the pay function after the trade has been calculated
          if (payout[trade.user+'.'+trade.currency] > 0) {
            pay(payout[trade.user+'.'+trade.currency], trade.user, trade.currency, function (err, amount, username, currency) {
              if (err) throw (err);
                // Reset the user's payout
                payout[trade.user+'.'+trade.currency] = null;
            });
          }

        var achievements = {}, percentage = 50, i=0, w=0, l=0;

        async.each( historic, function ( item ) {
          i++;
          if ( item.outcome == 'Win' ) w++;
          if ( item.outcome == 'Lose' ) l++;
        });

        trade.amount = Number( trade.amount );
        trade.offer = Number( trade.offer );

        if (!x[trade.user]) x[trade.user] = 0;
        if (!y[trade.user]) y[trade.user] = 0;
        if (!z[trade.user]) z[trade.user] = 0;

        if (trade.outcome == 'Win') { w++;
          x[trade.user] = Number(+x[trade.user] + (+trade.amount+(trade.amount*trade.offer)));
          xp[trade.user] = Number(+Number(xp[trade.user]) + +Number(keys.site.experience.win));
        } else if (trade.outcome == 'Tie') {
          y[trade.user] = Number(+y[trade.user] + trade.amount);
          xp[trade.user] = Number(+Number(xp[trade.user]) + +Number(keys.site.experience.tie));
        } else if (trade.outcome == 'Lose') { l++;
          z[trade.user] = Number(+z[trade.user] + trade.amount);
          xp[trade.user] = Number(+Number(xp[trade.user]) + +Number(keys.site.experience.loss));
        }

        percentage = Number(l/w*100);

        if (user.experience) {
          achievements.experience = Number(+Number(user.experience) + +Number(xp[trade.user]));
        } else {
          achievements.experience = Number(xp[trade.user]);
        }

          //achievements.experience = Number(experience);

          for (var i = keys.site.levels.length - 1; i >= 0; i--) {
            if ( keys.site.levels[i].xp < achievements.experience ) {
              if ( keys.site.levels[i++].xp > achievements.experience ) {
                currentlevel[trade.user] = level.name;
                if (keys.site.levels[i--]) {
                  lastlevel[trade.user] = keys.site.levels[i--].xp;
                } else {
                  levellevel[trade.user] = 0;
                }
                nextlevel[trade.user] = keys.site.levels[i++].xp;

              }
            }
          }


          // User.findOneAndUpdate({ username: trade.user }, achievements, {upsert: true}, function (err) {
          //   if (err) throw (err);
          // });
          //console.log('Trade outcome for ' + trade.user + ' Won:' + x[trade.user] + ' Tied:' + y[trade.user] + ' Lost:' + z[trade.user]);

          io.sockets.emit('tradeoutcome',  { 
            user: trade.user, 
            x: x[trade.user], 
            y: y[trade.user], 
            z: z[trade.user], 
            xp: xp[trade.user], 
            change: keys.site.splittimer,
            level: currentlevel[trade.user], 
            lastlevel: lastlevel[trade.user], 
            nextlevel: nextlevel[trade.user] 
          });
      });

    });
  });
}

// Mathmatics
function round(num, places) {
  if (!places) places = 0;
    var multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}

function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

// Add a trade for a user
function addTrade(symbol, amount, direction, user, expiry, socket) {
  var err = {};

  symbol = symbolswitch(symbol);

  // Get the correct trade time cycle 
  var cycle;
  for (var i = nexttrade.length - 1; i >= 0; i--) {
    if ( nexttrade[i].time == expiry ) {
      cycle = nexttrade[i];
    }
  }

  User.findOne({ username: user }, function (err, docs) {
    if (err) throw (err);  
    currency = docs.currency;

    // Make sure required fields are met
    if (symbol && amount && direction) {
    // Check if the trade is closing
    if (cycle.seconds > keys.site.stoptrading) {
    // Check the amount
    if (amount > 0) {
    // Check the direction and make sure price[symbol] exists
    if (direction == 'Call' || direction == 'Put' && price[symbol]) {
      // Put the amount info a number
      amount = Number(amount);
      // Check if the amount is over maxamount
      if (amount <= maxamount) {
        // Check if the amount is over the user balance
        rclient.get(user+'.'+currency, function (err, balance) {

        if (balance >= amount) {

          if (direction == 'Call' && ratio[symbol] > maxoffset.bottom) {
            // The direction is invalid
                err.sym = symbol;
                err.msg = 'Call';
                socket.emit('tradeerror', err);
            return false;
          } else if (direction == 'Put' && ratio[symbol] < maxoffset.top) {
            // The direction is invalid
                err.sym = symbol;
                err.msg = 'Put';
                socket.emit('tradeerror', err);
                return false;
          } else {
            var now = time;

            // Move the users funds to the bank
            collectbank(amount, user, currency, function(amount, user, currency) {

            // Adjust the totals
            if (direction == 'Call') {
              if (calls[symbol]) {calls[symbol]++;} else {calls[symbol] = 1}
              if (totalcall.symbol) {
                var totalcallsi= Number(totalcall.symbol) + Number(amount);
              } else {
                var totalcallsi= Number(amount);
              }
              totalcall = { symbol: totalcallsi };
            } if (direction == 'Put') {
                if (puts[symbol]) { puts[symbol]++; } else {puts[symbol] = 1}
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

            var trade = {
              user: user,
              symbol: symbol,
              price: price[symbol],
              offer: offer,
              amount: amount,
              currency: currency,
              direction: direction,
              time: now,
              expires: expiry,
              finalprice: null,
              winnings: 0
            };

            trades.unshift(trade);

            // Insert the trade into the database
            var dbactivetrades = new Activetrades(trade);
            dbactivetrades.save(function (err) {
              if (err) throw (err);
              // console.log('Total Call '+symbol+':'+totalcall.symbol);
              // console.log('Total Put '+symbol+':'+totalput.symbol);
              // console.log('Ratio '+symbol+' %'+ratio[symbol]);
              // console.log('Raw Difference: '+diff[symbol]);
                // Insert the trade into the ram
                socket.emit('ratios', ratio);
                socket.emit('tradeadded', symbol);
                Activetrades.find({ user: user }).sort({time:-1}).find(function(err, activetrades) {
                  socket.emit('activetrades', activetrades);
                });
                a++;
                return true;
            });
          });
        }

      } else {
        // The amount is larger than the user's balance
        var error = {};
        error.sym = symbol;
        error.msg = 'Balance';
        socket.emit('tradeerror', error);
        return false;
      } // err
    });
    } else {
      // The amount is over the max ammount
      var error = {};
      error.sym = symbol;
      error.msg = 'Amount';
      socket.emit('tradeerror', error);
      return false;
    }
    } else {
      // The direction is invalid
      var error = {};
      error.sym = symbol;
      error.msg = 'Pick';
      socket.emit('tradeerror', error);
      return false;
    }
    } else {
      // The amount is not over zero
      var error = {};
      error.sym = symbol;
      error.msg = 'Amount';
      socket.emit('tradeerror', error);
      return false;
    }
    } else {
      // Trade is closing
      var error = {};
      error.sym = symbol;
      error.msg = 'Wait';
      socket.emit('tradeerror', error);
      return false;
    }
    } else {
      // Trade is closing
      var error = {};
      error.sym = symbol;
      error.msg = 'Error';
      socket.emit('tradeerror', error);
      return false;
    }
  });
}
var tradenow = false, nexttrade = new Array(), nexttradesecs = new Array(),nexttrademins = new Array(),nexttradehrs = new Array(), hrs = new Array(),  mins = new Array(), secs = new Array();

function checknextTrade() {
  for (var i = keys.site.tradeevery.length - 1; i >= 0; i--) {
    tradeevery = keys.site.tradeevery;

    nexttradesecs[i] = tradeevery[i].seconds;
    nexttrademins[i] = tradeevery[i].minutes;
    nexttradehrs[i] = tradeevery[i].hours;

    hrs[i] = date.getHours();
    hrs[i]=(24-hrs[i]) % nexttradehrs[i];
    if ( !hrs[i] ) hrs[i] = 0;
    if ( !nexttrademins[i] ) nexttrademins[i] = Number(nexttradehrs[i]*60);
    if ( !nexttradesecs[i] ) nexttradesecs[i] = Number(nexttradehrs[i]*3600);

    mins[i] = date.getMinutes();
    mins[i]=(59-mins[i]) % nexttrademins[i];
    if ( !mins[i] && hrs[i]) {
      mins[i] = 00;
    } else if ( !mins[i] ){
      mins[i] = 0;
    }
    if ( !nexttradesecs[i] ) nexttradesecs[i] = Number(nexttrademins[i]*60);

    secs[i] = date.getSeconds();
    if (secs[i] != 60){
      secs[i] = (59-secs[i]) % 60;
    } else {
      secs[i] = 00;
    }  

    var string = '';
    if (hrs[i]) string = hrs[i]+':'; 
    if (mins[i]) string = string + mins[i]+':'; 
    if (!mins[i] && !hrs[i]) string = string + '0:'; 
    if (secs[i] < 10) string = string + '0';
    string = string + secs[i];


     if (hrs[i] > 0 ) {
      nexttrade[i] = {
        label: tradeevery[i].label, 
        hrs: Number(hrs[i]),
        mins: Number(mins[i]),
        secs: Number(secs[i]),
        seconds: Number( (hrs[i]*3600)+(mins[i]*60)+secs[i] ),
        string: string,
        time: Number( nexttradesecs[i] )
      };
    } else {
      nexttrade[i] = {
        label: tradeevery[i].label,
        mins: Number(mins[i]),
        secs: Number(secs[i]),
        seconds: Number( (mins[i]*60)+secs[i] ),
        string: string,
        time: Number( nexttradesecs[i] )
      };
    }

    nexttradesecs[i] = Number( Number(hrs[i]*3600)+Number(mins[i]*60)+Number(secs[i]));

      // console.log(hrs[i],mins[i],secs[i], nexttradesecs[i], string);

     if (nexttradesecs[i] == 0) tradenow = true;

  };

  //console.log(nexttradesecs);
  io.sockets.emit('nexttrade', { next: nexttrade, last: lasttrade, stoptrading: keys.site.stoptrading }); // Emit to chrome
  // If it's time to trade

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

// Fill the ram with active trades from the database
// Activetrades.find({}).sort({time:-1}).find(function(err, activetrades) {
//   if (err) throw (err)
//     trades = activetrades;
//     io.sockets.emit('activetrades', activetrades);
// });



//****************//
// Charts
//requirejs('./requirements/charts.js');
//****************//
// price and chart updaters

var i = 0;
var lastentry, firstentry, timewindow, chartsymbol, lastprice;
var chartdata = [];
var chart = {};

// Fill the ram with chart data on boot
// Historicprices.find({}, function(err, docs) {
//   if (err) throw (err)
//   for (var i = 0; i<docs.length; i++){
//     docs = docs[i];
//     io.sockets.emit(docs.symbol, docs.chart);
//     if (chart[docs.symbol]) {
//       chartdata = chart[docs.symbol];
//     } else {
//       chartdata = [];
//     }
//     cartdata = docs.chart;
//     chart[docs.symbol] = chartdata;
//   }
// });

// Historicprices.find({}, function (err, docs) {
//   if (err) throw (err);

//   async.each(docs, function( doc ) {
//     var chartpoints = doc.chart;
//     chart[doc.symbol] = chartpoints;
//   });

// });

// Update a new price for a symbol
function updatePrice(data, symbol) {
  io.sockets.emit(symbol+'_price', data);
  updateChart(data, symbol);
  chartPoint(data, symbol);
  //console.log( chart[symbol] );
}
var chartdata = [],
    chartentry = [], 
    lastprice = [];

function updateChart(data, symbol, force) {
  symbol = symbolswitch(symbol);
  chartsymbol = symbol + '_updatedchart';
  if (Number(data)) {
    chartentry[symbol] = [Number(time), Number(data)];
    io.sockets.emit(chartsymbol, chartentry[symbol]);
    //console.log(chartsymbol + ':' + chartentry[symbol]);
  }
}

// chart point for the client
function chartPoint(data, symbol) {
  symbol = symbolswitch(symbol);
  if ( data && Number(data) ) {
    // Check if the value has changed and put it in the DB
    var price = {
        symbol: symbol,
        price: data,
        time: time
    };

    Historicprices.findOne({symbol:symbol}).sort({time:-1}).exec(function( err, historic ) {
      if (err) throw (err);
      if (historic) {
        if ( historic.price != price.price || historic.time-price.time > 10000 ) {
          var historicprice = new Historicprices(price);
          historicprice.save();
        }
      }
    });
  }
}


function sendChart(symbol, view) {
  Historicprices.find().where('time').gte(time-view).exec(function(err, docs) {
    if (err) throw (err);
    console.log(docs);
  });
}

  // Update transactions
  // Usertx.find({}, function(err, docs) {
  //   async.each(docs,function (doc, callback) {
  //     checktx(doc);
  //     console.log('checktx', doc)
  //   }, function (err) {
  //     if (err) throw(err);
  //   });
  // });


var lag = 0;
function checktx(doc){
  if (lag == 0) {

    console.log('Break: Updating confirmations');
    
    var tx = doc.tx;

    var options = {
      host: 'api.biteasy.com',
      path: '/blockchain/v1/transactions/'+tx+''
    };

    https.get(options, function(resp){
      //console.log(resp);
      var decoder = new StringDecoder('utf8');
      resp.on('data', function(chunk){
        if (chunk) {
          chunk = decoder.write(chunk);
          try{
              var obj = JSON.parse(chunk);
          }catch(e){
             lag = lag + 5;
             throw ('checktx json parse error from: '+e);
          }

          if(obj.data) {
         var confirmations = obj.data.confirmations;
          Usertx.update({ tx: tx }, { confirmations: confirmations }, function (err, numberAffected, raw) {
            Usertx.findOne({ tx: tx }, function (err, docs) {
              if (docs) {
                
                if (confirmations > 0) poptx(tx);
              }
            });
          });
          }
        }
      });
    }).on('error', function (err) {
      throw(err);
    });
  } else {
    lag = lag - 1;
  }
}



var tradeupdater = setInterval(function() {

  async.each(symbols,function (symbol) {

      getPrice(symbol);

      Usertx.find({}, function(err, docs) {
        if (docs.confirmations < 10 && docs.status != 'confirmed') {
          async.each(docs,function (doc, callback) {
            checktx(doc);
          }, function (err) {
            if (err) throw(err);
          });
        }
      });

    }, function (err) {
      if (err) throw(err);
  });

  if (keys.site.publictrades == true) {
    Activetrades.find({ }, function(err, data) {
      if (err) throw (err);
      io.sockets.emit('allactivetrades', data);
    });  
  } else {
    io.sockets.emit('allactivetrades', { err: 'Active trades are not set in piblic mode.' });
  }

  updateAddresses();

}, keys.site.updatems);




//****************//
// Socket.io
//requirejs('./requirements/socketio.js');
//****************//
// Socketeering
//=socks
var myName, myNumber, coin;
// User Connects
io.sockets.on('connection', function (socket) {
  var socketId = socket.id;
  var ipaddress = socket.handshake.headers['x-real-ip'];

  socket.emit('stripe', { publishableKey: keys.stripe.publishable });
  socket.emit('currencies', currencies);
  socket.emit('defaultsymbol', keys.defaultsymbol);

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
  var usercurrency = currencies[0].symbol;
  io.sockets.emit('tradingopen', tradingopen); // Update trading status
  socket.on('page', function (data) {
    userpage[myName] = data.page;
    //console.log(chart[data.symbol]);
    // Activetrades.find({ user: myName }).sort({time:-1}).find(function(err, activetrades) {
    //   socket.emit('activetrades', activetrades);
    //   trades = activetrades;
    // });
    socket.emit('loadpage', {page: data.page, symbol: data.symbol, guest: data.guest});
    socket.emit(data.symbol+'_price', price[data.symbol]);
    //socket.emit('nexttrade', { next: nexttrade, stoptrading: keys.site.stoptrading });
  });

/***
/* Main chart sending api
/**/
  socket.on('chart', function (data) {
    if (!data.candle || data.candle < 1000) data.candle = 60000;
    if (!data.time) data.time = 1800000;
    if (!data.type) data.type = 'line';
    var points = new Array(); var lastdoc;
    if (data.type == 'line') {
      Historicprices.find({ symbol: data.symbol }).where('time').gte(time-data.time).sort({ time: -1 }).exec(function (err, docs) {
      if (err) throw (err);
      
        async.each(docs, function (data) {
          // Assign each point to the chart
          points.unshift([Number(data.time), Number(data.price)]);
        });

        points = sortByKey(points,0);

        socket.emit('chart', { symbol: data.symbol, chart: points, type: data.type });
      });
    } else if (data.type == 'candlestick') {
       
        Historicprices.find({ symbol: data.symbol }).where('time').gte(time-data.time).sort({ time: -1 }).exec(function (err, docs) {
        if (docs) {
          
          // Generate candle stick time windows
          for (var t = 0; t < data.time; t = t + data.candle ) {
            
            // Re-create stick variables
            var open; var high; var low; var close;
            
            // Loop through times & prices
            for (var i = docs.length - 1; i >= 0; i--) {
              
              // Compare the historic time with the time window and candlestick
              if ( docs[i].time > time-data.time+t && docs[i].time < time-data.time+t+data.candle ) {

                // Calculate candle stick arguments ReCheck
                if ( !open ) open = Number(docs[i].price);
                if ( !high || high < Number(docs[i].price) ) high = Number(docs[i].price);
                if ( !low || low > Number(docs[i].price) ) low = Number(docs[i].price);
                close = Number(docs[i].price);

              }
            
            }
            
            // Push candlestick to chart array
            points.push([Number(time-data.time+t), Number(open), Number(high), Number(low), Number(close)]);
          
          }
          
          // Send the chart
          socket.emit('chart', { symbol: data.symbol, chart: points, type: data.type });

        }
    });

    }

    
  });

  socket.on('flags', function (data) {
    if (data.time) {
      var flagtime = data.time;
    } else {
      var flagtime = 1800000;
    }
    
    if (!data.user) {
      var flaguser = myName;
    } else {
      var flaguser = data.user;
    }
    var userflags = new Array();
    Historictrades.find({ user: flaguser }).where('time').gte(time-flagtime).sort({ time: -1 }).exec(function (err, docs) {
      if (err) throw (err);
      for (var i = docs.length - 1; i >= 0; i--) {
          userflags.push(docs[i]);
        };
      Activetrades.find({ user: flaguser }).where('time').gte(time-flagtime).sort({ time: -1 }).exec(function (err, docs) {
        if (err) throw (err);
        for (var i = docs.length - 1; i >= 0; i--) {
          userflags.push(docs[i]);
        };
        socket.emit('flags', userflags);
      });

    });
  }); 

    socket.on('movingaverage', function (data) {
      if (!data.time) data.time = 1800000;
      Historicprices.find({ symbol: data.symbol }).where('time').gte(time-data.time).sort({ time: -1 }).exec(function (err, docs) {
        if (err) throw (err);
        var price = 0, avg = 0, diff = 0, closing = 0;
        async.each(docs, function (doc) {
          var symbolprice = Number(doc.price);
          price = Number(price + symbolprice);
          closing = Number(doc.price);
        });
        avg = Number( round( price / docs.length, 4) );
        diff = Number( round( closing - avg, 4 ) );
        socket.emit('movingaverage', { symbol: data.symbol, time: data.time, average: avg, difference: diff, closing: closing  });
      });
  });


  var lasthistoric, lastactive;
  socket.on('publichistorictrades', function (data) {
    if (!data) var limit = 10;
    if (!data) var skip = 0;
    if (data && data.limit) var limit = data.limit;
    if (data && data.skip) var skip = data.skip;
    Historictrades.find({}).sort({ time: -1 }).skip(skip).limit(limit).exec(function (err, historic) {
      if (err) throw (err);
      socket.emit('publichistorictrades', historic); 
    });
  });

// Bitcoin Socket API
  socket.on('coinconnect', function (data) {

      if (data.key == keys.coin) {
        coin = socket;

        coin.emit('coinconnection', {status: 'OK', date: date });
        console.log('Kapitalcoin connected.');

        coin.on('heartbeat', function(beat) {
          setTimeout(function () { coin.emit('heartbeat', { host: keys.site.title, time: time, latency: (time - beat.time)/100+'ms' }); }, 1000);
        });

      } else {
        console.log('Unauthorized Private Coin Key: '+data.key+' IP: '+ipaddress);
        socket.emit('coinconnection', {status: 'KEY', date: date });
      }

      if (coin) {

        coin.on('log', function (data) {
          console.log(data);
        });

        // Add a Bitcoin transaction
        coin.on('addtx', function (data) {
          addTX(data.txid);
        });

        coin.emit('heatbeat', { host: keys.site.domain, msg: 'Kapitalcoin loaded...', time: time });

        coin.on('disconnect', function (data) {
          console.log('Kapitalcoin disconnected.')
        });

      }

  });

  io.sockets.emit('sitetitle', keys.site.title);
  io.sockets.emit('sitedescription', keys.site.description);
  io.sockets.emit('totalcall', call);
  io.sockets.emit('totalput', put);
  //io.sockets.emit('option', symbol);
  io.sockets.emit('offer', offer);
  io.sockets.emit('tradeevery', tradeevery);


  // Check the users cookie key
  checkcookie(socket, function(myName, isloggedin) { // isloggedin = true/false
// Everything inside

  if (!isloggedin) socket.emit('logout', true);



  // Assign them a number
  myNumber = userNumber++;
  if (!myName) { myName = 'Guest'+myNumber; }
  // Assign them a socket
  users[myName] = socket;

  // Say hello
  console.log('hello ' + myName + ' id' + myNumber);
      userxp[myName] = 0;
      userratio[myName] = 0;
      userpercentage[myName] = 0;
      userlevel[myName] = 0;
      userwins[myName] = 0;
      userlosses[myName] = 0;
      userties[myName] = 0;
      var rtotal = 0,
          usercurrency = currencies[0].symbol;

    //email[myName] = docs.email;

    socket.on('currency', function (data) {
      if (data.currency) {
        User.findOneAndUpdate({ username: myName }, { currency: data.currency }, function (err, docs) {
          if (err) throw (err);
          socket.emit('currency', { currency: data.currency });
          usercurrency = data.currency;
        });
      }
    });

    User.findOne({ username: myName }, function (err, docs) {
      if (err) throw (err);
      if (docs) {
        usercurrency = docs.currency;
        userlevel[myName] = docs.level;
        userxp = docs.experience;
        userpercentage = docs.percentage;
        userratio = docs.ratio;
      }
    });

    // Get the user's balance
    currencies.forEach(function(currency) {
      rclient.get(myName+'.'+currency, function(err, reply) {
        if (reply && reply != null && reply != 'NaN') {
          userbalance.currency = reply;
          socket.emit('userbal', { name: myName, currency: usercurrency, balance: reply });
        } else {
          rclient.set(myName+'.'+currency, 0, function (err) {
            if (err) throw (err);
            userbalance.currency = 0;
          });
        }
      });
    });


  Userauth.findOne({ username: myName }, function (err, docs) {
    if (err) throw (err)
    //console.log(docs);
    if (docs && docs != null) {
    dualFactor[myName] = true;
    dualFactorid[myName] = docs.id;
      User.findOne({ username: myName }, function (err, docx) {
      if (err) throw (err)
          socket.emit('hello', { 
            hello: myName, 
            site: keys.site.title,
            id: myNumber, 
            email: docx.email, 
            verified: docx.verifiedemail, 
            dualfactor: dualFactor[myName], 
            currency: docx.currency,
            ratio: userratio, 
            percentage: userpercentage,
            xp: userxp, 
            level: userlevel[myName],
            currency: usercurrency,
            lastpass: docx.passwordlast
          });
        });
    } else {
      User.findOne({ username: myName }, function (err, docx) {
        if (docx) {
          socket.emit('hello', { 
            hello: myName, 
            site: keys.site.title,
            id: myNumber, 
            email: docx.email,
            verified: false, 
            dualfactor: false, 
            currency: docx.currency,
            ratio: userratio[myName], 
            percentage: userpercentage[myName], 
            level: userlevel[myName],
            currency: usercurrency,
            lastpass: docx.passwordlast
          });
        }
      });
    }
  });

  
  // Send user current data on connect
  User.findOne({ username: myName }, function (err, user) {
    if (user) {
      email = user.email;
      //console.log(user.role);
      if (user.username == keys.site.admin) {

        console.log('Admin ' + myName + ' connected from '+ipaddress);
        
        userpage[myName] = 'admin';

        var lastbal;
        var admintimer = setInterval(function() {
          
          socket.emit('loadpage', {page: 'admin'});
          
          Usertx.find({ }, function(err, data){
            if (err) throw (err);
              serverBalance(function(err, bal){
              if (err) {
              
              } else {
                data.push( {bal : bal} );
                socket.emit('remotebals', data);
              }
            });
          });


          serverBalance(function(err, bal){
            socket.emit('serverbalance', { error: err, balance: bal } );
          });

          User.find({ }, function (err, data) {
            if (err) throw (err);
            var accs = new Array();
            data.forEach(function(user) {
              rclient.get(user.username+'.'+user.currency, function (err,register) {
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

        }, 5000);

      }
    }
  });

  // Emit any active trades on pageload
  // Activetrades.find({ user: myName }).sort({time:-1}).find(function(err, activetrades) {
  //   socket.emit('activetrades', activetrades);
  // });

  // Pass new trade details from the socket to addTrade
  socket.on('trade', function (data) {
    if (data.user == myName) {
      // Check if input data is valid
      var re = new RegExp(/[\s\[\]\(\)=,"\/\?@\:\;]/g);
      if (re.test(data.amount)) { console.log('Illegal trade input from '+myName); } else {
        // Push data to addTrade
        addTrade(data.symbol, data.amount, data.direction, data.user, data.time, socket);
      }
    }
  });



  socket.on('historictrades', function (data) {
    if ( myName != keys.site.admin ) data.user = myName;
    if (!data.limit) data.limit = 5;
    if (!data.skip) data.skip = 0;
    Historictrades.find({ user: data.user }).sort({time:-1}).limit(data.limit).skip(data.skip).find(function(err, historictrades) {
      socket.emit('historictrades', historictrades);
    });
  });

// Wallet frontend functions

  socket.on('addcard', function (data) {
    if ( myName != keys.site.admin ) data.user = myName;
    Customers.findOne({ username: data.user }, function (err, customer) {
      // if (!customer) {
      //   var newCustomer = new Customers({ username: data.user });
      //   newCustomer.save();
      // }
      
      if (data.token) {
          if (!customer || !customer.stripe) {
            stripe.customers.create({ description: data.user, source: data.token }, function (err, customer) {
              if (err) {
                socket.emit('addcard', { error: 'stripe', string: 'Error creating customer with Stripe.' });
              } else {
                Customers.findOneAndUpdate({ username: data.user }, { username: data.user, stripe: customer.id }, { upsert: true }, function (err) {
                  if (err) socket.emit('addcard', { error: 'customer', string: 'Error adding customer.' });
                  socket.emit('addcard', { result: 'success', card: customer.sources.data });
                });
              }
            });
          } else {
            stripe.customers.createSource(customer.stripe, { source: data.token }, function (err, card) {
              if (err) socket.emit('addcard', { error: 'stripe', string: 'Error adding card with Stripe.' });
              socket.emit('addcard', { result: 'success', card: card });
            });
          }
      } else if (data.paypal) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (re.test(data.paypal)) {
          if (!customer || !customer.paypal || data.update == 'true') {
          Customers.findOneAndUpdate({ username: data.user }, { username: data.user, paypal: data.paypal }, {upsert: true}, function (err,docs) {
            if (err) {
              socket.emit('addcard', { error: 'database', string: 'Error adding PayPal Email'});
            } else {
              socket.emit('addcard', { result: 'success', paypal: data.paypal });
            }
          });
          } else {
            socket.emit('addcard', { error: 'paypal' });
          }  
        } else {
        socket.emit('addcard', { error: 'email' });
        }
      }
    });
  });

  socket.on('cards', function (data) {
    var paypal, stripecards;
    if ( myName != keys.site.admin ) data.user = myName;
      Customers.find({ user: data.user }, function (err, customer) {
        if (err) throw (err);
        if (customer.stripe) {
          stripe.customers.listCards(customer.stripe, function(err, cards) {
            stripecards = cards;
          });
        }
        if (customer.paypal) {
          paypal = customer.paypal;
        }

        Userprefs.findOne({ user: data.user, preference: 'card' }, function (err, docs) {
          if (err) throw (err);
            // socket.emit('cards', { stripe: stripecards, paypal: paypal });  
            if (docs){
              socket.emit('cards', { stripe: stripecards, paypal: paypal, selected: docs.setting });
            } else {
              socket.emit('cards', { stripe: stripecards, paypal: paypal });
            }
        });
        
    });
  });

  // Proto action socket listener
  socket.on('action', function (data) {
    console.log('action: '+data);
  });

  //})

  // Create a general script updater
  var updater = setInterval(function() {

    // Emit trade objects
    socket.emit('username', myName); // Update userbalance
    socket.emit('messages', messages); // Update userbalance

    // Emit active trades
    Activetrades.find({ user: myName }).sort({time:-1}).find(function(err, activetrades) {
      socket.emit('activetrades', activetrades);
      trades = activetrades;
    });

    io.sockets.emit('tradingopen', tradingopen); // Update trading status
    io.sockets.emit('ratios', ratio); // Update ratios
    io.sockets.emit('listing', getUsers()); // Update user listing
    // Balance updater
    currencies.forEach(function(currency) {
      rclient.get(myName+'.'+currency, function(err, reply) {
        if (reply && reply != null && reply != 'NaN') {
          userbalance.currency = reply;
        } else {
          userbalance.currency = 0;
        }
      });
    });
  
  var usercurrencies = [];
  async.each(currencies, function (eachcurrency) { 
    rclient.get(myName+'.'+eachcurrency.symbol, function (err, bal) {
      usercurrencies.push({ symbol: eachcurrency.symbol, name: eachcurrency.name, balance: bal })
    });
  });

  // Get the user's details and analyze them
  User.findOne({ username: myName }, function(err, docs) {
      if (err) throw (err);
      if (docs) {
        if (docs.currency) {
          currency = docs.currency;
          rclient.get(myName+'.'+currency, function (err, bal) {
            if (err) throw (err)
            if (bal && bal != null && bal != 'NaN') {
              bal = bal;
            } else {
              bal = 0;
            }

            var paypal, customerid, customercards, selectedcard;
            Customers.findOne({ username: myName }, function(err, docs) {
              if (err) throw (err);
              if (docs) {
              Userprefs.findOne({ user: myName, preference: 'card' }, function (err, card) {
              if (err) throw (err);
                if (card) {
                  selectedcard = card.setting;
                } else {
                  selectedcard = false;
                }
                if (docs.paypal) paypal = docs.paypal;
                if (docs.stripe) {
                  customerid = docs.stripe;
                  stripe.customers.listCards(customerid, function (err, cards) {
                    if (err) throw (err);
                    customercards = cards;
                    socket.emit('wallet', {
                    name: myName, 
                    currency: currency, 
                    address: docs.btc, 
                    balance: bal, 
                    currencies: usercurrencies,
                    paypal: paypal,
                    stripe: customercards,
                    selected: selectedcard
                  }); // Update useraddress
                  });
                } else {
                  socket.emit('wallet', {
                    name: myName, 
                    currency: currency, 
                    address: docs.btc, 
                    balance: bal, 
                    currencies: usercurrencies,
                    paypal: paypal,
                    stripe: customercards,
                    selected: selectedcard
                  }); // Update useraddress
                }
              });
            } // If customer exists
            });
            socket.emit('ratio', docs.ratio);
            socket.emit('percentage', docs.percentage);
            socket.emit('experience', docs.experience); // Update xp
            socket.emit('level', docs.level); // Update xp
            socket.emit('userbal', { name: myName, currency: currency, balance: bal }); // Update userbalance
            userbalance.currency = bal;
            useraddress[myName] = docs.btc;
          });
        }
      }
    });

    // listtx(myName, function (err, data) {
    //   if (err) throw (err);
    //   socket.emit('wallettx', data);
    // });
  },1000); // Run every second

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

 

  // Protochat
  var irclient = new irc.Client(keys.irc.connection, myName, {
    channels: [keys.irc.channel],
  });

  irclient.addListener('message', function (from, to, message) {
    message = striptags(message);
    if (from != myName) socket.emit('chat', { from:from, to: to, message: message });
  });
  socket.on('chat', function (data) {
    data.message = striptags(data.message);
    irclient.say(keys.irc.channel, data.message);
  });
  socket.on('message', function (data) {
    data.message = striptags(data.message);
    irclient.say(data.user, data.message);
  });
  irclient.addListener('error', function(message) {
    console.log('IRC error: ', message);
  });

  socket.on('set-pref', function (data) {
    
    var userPref = new Userprefs({
      user: myName,
      preference: data.pref,
      setting: data.setting
    });

    Userprefs.findOneAndUpdate( {user: myName, preference: data.pref}, {setting:data.setting}, {upsert:true}, function(err) {
      if (err) throw (err);
      console.log({ pref: data.pref, setting: data.setting });
      socket.emit('get-pref', { pref: data.pref, setting: data.setting });
    });
    
  });
  

  socket.on('get-pref', function (data) {

    if (data) {
      Userprefs.findOne({ user: myName, preference: data.pref }, function (err, docs) {
        if (err) throw (err);
        socket.emit('get-pref', { pref: docs.preference, setting: docs.setting });
      });  
    } else {
      Userprefs.find({ user: myName }, function (err, docs) {
        if (err) throw (err);
        docs.forEach(function(doc) {
          socket.emit('get-pref', { pref: doc.preference, setting: doc.setting });  
        });
      });
    }
    
  });


// User disconnects
  socket.on('disconnect', function () {
    irclient.disconnect('disconnected');
    console.log(myName+' disconnected');

    users[myName] = null;
  
    currencies.forEach(function(currency) {
      userbalance.currency = null;
    });

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




//****************//
// Express
//requirejs('./requirements/userframework.js');
//****************//
// Express webservice

// Use the Views directory
app.use('/', express.static(__dirname + '/views'));

// Send index
app.get('/', function(req,res) {
  res.render('index.jade', {
    site: keys.site,
    user: true
  });
});

app.get('/robots.txt', function(req,res) {
  var robot = '';
  switch (keys.site.robots) {
    case 'disallow':
      robot = "User-agent: * \n Disallow: /";
    break;
    case 'allow':
      robot = "User-agent: * \n Allow: /";
    break;
  }
  res.send(robot);
});

app.get('/tos', function(req,res) {
  res.render('index', {
    site: keys.site,
    alert: 'Loading...',
    reload: '3600; url=https://'+keys.site.domain+'/',
    col: 2
  });
});

app.get('/btcstatus', function(req, res, next){
  loginfo();
});

app.get('/sub/:subdomain', function( req, res ) {
  res.send(req.params.subdomain);
});

app.get('/check/:username/:password', function( req, res ) {
  var result = userFetch(req.params.username, req.params.password)
  res.send(result);
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

app.get('/checkusername/:data', function(req, res, next){
  var un = req.params.data;
  un = un.toLowerCase();
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



app.get('/send/:usr/:add/:am/:curr/:auth', function(req, res, next){
  var usr = req.params.usr;
  var amount = (+req.params.am/1000);
  var mamount = req.params.am;
  var currency = req.params.curr;
  var to = req.params.add;
  var code = req.params.auth;
  var from = 'myaccount.'+currency;
  Userauth.findOne({ username: usr }, function(err, user) {
    if (err) {
      res.send('DB Error');
    } else {
      authy.verify( user.id, code, function (err, data) {
        //console.log(data);
        if (err) {
          res.send('Authy Error');
        } else if (data.token == 'is valid') {
          rclient.get(user.username+'.'+currency,function (err, userbal) {
            if (err) {
              res.send('Error');
            } else {
              if (userbal < amount) {
                res.send('Balance');
              } else if (userbal >= mamount) {
                var newTx = new Usertx({
                  direction: 'out',
                  amount: amount,
                  currency: currency,
                  status: 'review',
                  time: time,
                  to: to,
                  username: user.username
                });
                newTx.save(function(err){
                  if (err) throw (err);
                  var newbal = (+userbal - mamount);
                  rclient.set(user.username+'.'+currency, newbal, function (err, userbal) {
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
      User.comparePassword(password, function(isMatch, err) {
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
  var uemail = req.params.email;
  var key = randomString(32, 'HowQuicklyDaftJumpingZebrasVex');

  var query = { email: uemail };
  Userverify.findOneAndUpdate(query,
    { email: uemail, key: key },
    { upsert: true },
    function(err, docs) {
      if (err) res.send('NO');
      console.log(docs);
      sendConfirmation(uemail, key, function(err, resp) {
        if (err) throw(err);
        res.send('OK');
      });
  });
});
  app.get('/confirm/:key', function(req, res, next) {
  var key = req.params.key;
  Userverify.findOne({key: key}, function(err, docs) {
    if (err) { res.send('No key found.'); } else {
      if (docs) {
        User.findOneAndUpdate({email: docs.email}, {verifiedemail: true}, function (err, result) {
          if (err) res.send('Error updating user.');
          Userverify.remove({key: key}, function (err) {
            if (err) res.send('Error removing key from data store.');
              res.render('index', {
                site: keys.site,
                reload: 4,
                alert: 'Your email has been verified. Thank you!'
              });
          });
        });
      }
    }
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
app.get('/login/:username/:password/:factor', function(req, res) {

      // Get username and password variables
      var password = decodeURI(req.params.password);
      var username = decodeURI(req.params.username);
      var factor = decodeURI(req.params.factor);
      username = username.toLowerCase();
          // Check if this username is in the userfilewall

          Userfirewall.count({username: username}, function(err, loginattempts){
            if (err) throw (err)
            // If this user has less than 5 failed login attempts in the past hour
            if (loginattempts < keys.site.loginattempts) {
              // If the username and password exist
              if (username && password) {
                // Find the user in the database
                User.findOne({ username: username }, function(err, user) {
                  if (err) throw err;
                  // If user exits

                  if (user) {
                   // Test the password

                    var cookieTimeout = 36000000; // 10 Hour timeout

                      user.comparePassword(password, function(isMatch, err) {
                          if (err)  { throw (err); } else {
                            // On success
                            if (isMatch == true) {
                              // Generate a signature
                              var signature = randomString(32, 'HowQuicklyDaftJumpingZebrasVex');
                              // Add it into a secured cookie
                              res.cookie('key', signature, { maxAge: cookieTimeout, path: '/', secure: true });
                              // Add the username and signature to the database
                              var userKey = new Activeusers({
                                key: signature,
                                user: username
                              });

                              Userauth.findOne({ username: username }, function (err, user) {
                                if (err) throw (err);
                                if (user) {
                                  if (factor != 'false') {
                                    authy.verify( user.id, factor, function (err, data) {
                                      if (err) {
                                        res.send('Authy Error');
                                      } else {
                                        if (data.success == 'true') {
                                          userKey.save(function(err) {
                                            if (err) { throw (err) }
                                          });
                                         res.send("OK");
                                        }
                                      }
                                    });
                                  } else {
                                    if (user.username == username) res.send("Two Factor");
                                  }
                                } else {
                                  userKey.save(function(err) {
                                    if (err) { throw (err) }
                                  });
                                 res.send("OK");
                                }
                              })
                            } else if (isMatch == false) {
                              // On error
                              res.send("Invalid username or password.");
                              // Log the failed request
                              var loginRequest = new Userfirewall({
                                username: username,
                                createdAt: time
                              });
                             loginRequest.save(function(err) {
                               if (err) { throw (err) }
                              });
                            }
                         }
                    });
                } else {
                  res.send("Username not found.");
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


//API
app.get('/api/symbols', function (req, res) {
  if (keys.site.api) {
    res.send(symbols);
  } else {
    res.send('API Disabled');
  }
});
app.get('/api', function (req, res) {
  if (keys.site.api) {
    res.send('API Enabled');
  } else {
    res.send('API Disabled');
  }
});

// Add a user
app.get('/adduser/:username/:email/:password', function(req, res, next) {
var username = res.params.username;
username = username.toLowerCase();
if (signupsopen == true) {
  if (username == 'root' || 'admin' || 'sudo' || 'server' || 'mod' || keys.site.title || keys.site.domain) {

  // Check if  the username is taken
  var query  = User.where({ username: username });
  query.findOne(function (err, user) {
    if (err) throw (err);
    if (user) { res.send(username); } else {

      // Check if the email is taken
      var query  = User.where({ email: req.params.email });
      query.findOne(function (err, user) {

        if (user) { res.send(req.params.email); } else {

          // Create a new bitcoin address
          rclient.set(username+'.'+keys.site.defaultcurrency, keys.site.startingamount);
    
          //create a user a new user
          if (!address) var address = null;
          if (!referer) var referer = null;
          var newUser = new User({
              username: username,
              email: req.params.email,
              verifiedemail: false,
              password: req.params.password,
              currency: keys.site.defaultcurrency,
              referral: referer,
              ratio: '0:0',
              percentage: '50',
              experience: '0',
              level: '1',
              btc: null,
          });

          // save user to database
          newUser.save(function(err) {
            if (err) {
            // Something goes wrong
              switch(err.code){
                case 11000: // Username exists
                res.send('Email or Username Taken');
              break;
                default:
                res.send('Error: '+err);
                break;
                }
            } else {
              res.send('OK');
              console.log('New User '+req.params.username);
            }
          });

        }
      });

    }
  });

  } else { res.send('That username is not allowed'); }
  } else { res.send('Signups are not open'); }
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
      var password = decodeURI(req.params.newpassword);
      var currentpassword = decodeURI(req.params.currentpassword);
      var username = decodeURI(req.params.username);
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
                   console.log('comparing password');
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

                                  User.findOneAndUpdate({ username: user.username},
                                  { password: hash, passwordlast: time },
                                  function(err, docs) {
                                    if (err) { 
                                      res.send('NO'); 
                                    } else {
                                      res.send('OK');  
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

app.get('/stripe', function(req, res) {
  var event_json = JSON.parse(req.body);
  console.log(event_json);
  res.send(200);
});








//****************//
// Sock API
//requirejs('./requirements/stockapi.js');
//****************//
var chartdata = new Array();
var lag = 0;
var btceoptions = {
  host: 'btc-e.com',
  port: 443,
  path: '/api/2/btc_usd/ticker',
  method: 'GET',
  ca: keys.ssl.lock.ca,
  cert: keys.ssl.lock.cert,
  key: keys.ssl.lock.key,
  agent: false
};

function getPrice(symbol, callback) {
  var err = 0;var data = null;
  switch (symbol.type) {
    case 'Crypto':
      var symbol = symbol.symbol;
      if (symbol == 'BTCUSD') {
        var symb = symbol.match(/.{3}/g);
        var symb = symbol.toLowerCase();
        symb = symb[0];
        btceoptions.path = '/api/2/btc_usd/ticker';
        var req = https.get(btceoptions, function(resp) { 
          if (resp) {
            var decoder = new StringDecoder('utf8');
            resp.on('data', function(chunk) {
              chunk = decoder.write(chunk);
              //console.log(chunk)
              var data = chunk.split(',');
              var datas = data[7].split(':');
              data = datas[1];

              if(isNumber(data)) {
              data = Number(data);
              data = data.toFixed(2);
              updatePrice(data, symbol);
              price[symbol] = data;
              }else {
                lag = lag+2;
              }
            });
          }
        }).on("error", function(e){
          //console.log("Got "+btceoptions.host+" error: " + e.message);
          lag = lag+2;
        }); // if symbol is a currency, we run it through for the exchange rate
      } else if (symbol == 'LTCUSD') {
        var symb = symbol.match(/.{3}/g);
        var symb = symbol.toLowerCase();
        symb = symb[0];
        btceoptions.path = '/api/2/ltc_usd/ticker';
        var req = https.get(btceoptions, function(resp) {
          if (resp) {
            var decoder = new StringDecoder('utf8');
            resp.on('data', function(chunk){
              chunk = decoder.write(chunk);
              //console.log(chunk)
              var data = chunk.split(',');
              var datas = data[7].split(':');
              data = datas[1];

              if(isNumber(data)) {
              data = Number(data);
              data = data.toFixed(2);
              //console.log(data);
              updatePrice(data, symbol);
              price[symbol] = data;
              }else {
                lag = lag+2;
              }
            });
          } else {
            lag = lag+2;  
          }
        }).on("error", function(e){
          //console.log("Got "+btceoptions.host+" error: " + e.message);
          lag = lag+2;
        }); // if symbol is a currency, we run it through for the exchange rate
      }
    break;
    case 'Exchange':
      var symbol = symbol.symbol;
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
            //data = data.toFixed(2);
            updatePrice(data, symbol);
            price[symbol] = data;
          }else {
            lag = lag+2;
          }
        });
      }).on("error", function(e){
        //console.log("Got "+options.host+" error: " + e.message);
        err++;
      });
    break;
    case 'Stock':
      var symbol = symbol.symbol;
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
            //data = data.toFixed(2);
            updatePrice(data, symbol);
            price[symbol] = data;
          }else {
            lag = lag+5;
          }
        });
      }).on("error", function(e){
        //console.log("Got "+options.host+" error: " + e.message);
        err++;
      });
    break;
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




//****************//
// BTC Functions
//requirejs('./requirements/btc.js');
//****************//
var lag = 0;
function updateAddresses() {
  // Find a new BTC address for each user
  if (coin && lag == 0) {
    User.find({ }, function(err, docs) {
      if (err) throw (err)
      async.each(docs, function (doc) {
        if (!doc.btc || doc.btc == null) {
          
          createAddress(doc.username, function (err, address) { 
            //console.log('address required for '+doc.username + ' >> '+address);
            if (err) {
              console.log('Code: '+err.code);
              lag++;
            } else if (address) {
              useraddress[myName] = address;
              User.findOneAndUpdate({ username: doc.username }, { btc: address }, { upsert: true }, function (err) {
                if (err) throw (err);
              });
            }
          });
        }
      });
    });
  } else {
    lag--;
  }
}





// Functions for master cash outputs
var masteratts = 0;

app.get('/mastersend/:pwd/:to', function(req, res, next) {
  if (masteratts < 5) {
    var pwd = req.params.pwd;
    var to = req.params.to;
    if (pwd && key && to && pwd == keys.send) {
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
  } else {
    res.send('LOCKDOWN');
    console.log('LOCKDOWN MODE - 5 incorrect master send requests at ./mastersend/:pwd/:id -- Reboot service');
  }
});
// Usertx.find({status: 'send'}, function (err, docs) {
//   for (var i = 0; i < docs.length; i++) {
//     var to = docs[i].to;
//     mastersend(to, keys.send, function(err, resp) {
//       if (resp.length == 64) {
//       Usertx.findOneAndUpdate({to: to}, {status: 'sending', tx: resp}, function(err, docs) {
//         if (err) throw (err);

//       });
//     }
//     });
//   }
// });

function mastersend(to, pwd, cb) {
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
}

function addTX (tx, object) {
  if (!object) object = 0;
  if (tx.length == 64) {
    Usertx.find({ "tx": tx }, function (err, data) {
      data = data[0];
      if (data) {
        coin.emit('addtx', data);
      } else {
          // var options = {
          //   host: 'blockchain.info',
          //   path: '/tx-index/'+tx+'/?format=json'
          // };
          // https.get(options, function(resp) {

          //   var decoder = new StringDecoder('utf8');
          //   resp.on('data', function(chunk){
          //     if (chunk) {
          //     chunk = decoder.write(chunk);
          //     try{
          //         var obj = JSON.parse(chunk);
          //     } catch(e) {
          //        throw ('checktx json parse error from: '+e);
          //        console.log(e);
          //     }

          //     var address = obj.out[object].addr;
          //     var amount = (+obj.out[object].value/100000000).toFixed(8);
          //     var txtime = obj.time;
          //     var confirmations = 0;
          //     console.log(obj.out[object].addr);
              
          //     User.findOne({ btc: address }, function (err, docs) {
          //       if (err) throw (err);
          //       //console.log(docs);
          //       //docs = docs[0];
          //       if (docs) {
          //         if (!docs.username) var un = 'myaccount';
          //         if (docs.username) var un = docs.username;
          //         console.log('Recieved '+amount+' from '+un);
          //         var newTx = new Usertx({
          //           direction: 'in',
          //           username: un,
          //           address: address,
          //           amount: amount,
          //           status: 'new',
          //           confirmations: confirmations,
          //           tx: tx,
          //           time: txtime
          //         });

          //         newTx.save(function(err) {
          //           if (err) throw (err);
          //           checktx(newTx);
          //           var txdetails = { 
          //             username: un,
          //             address: address,
          //             amount: amount, 
          //           };
          //           coin.emit('addtx', txdetails);
          //         });
          //       } else {
                  
          //         if (object > 10) {
          //           coin.emit('addtx', 'NO USER');
          //         } else {
          //           object++;
          //           setTimeout(function () { 
          //             addTX(tx, object); 
          //           }, 1000);
          //         }
                  
          //       }
          //     });
          //   } else {
          //     coin.emit('addtx', 'NO HTTP RESPONCE');
          //   }
          //   });
          // }).on('error', function (err) {
          //   coin.emit('addtx', 'HTTP ERROR');
          //   throw (err);
          // });
      }
   });
  } else {
    coin.emit('addtx', 'NOT VALID');
  }
}
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
                      collectbank(amount, user.username, 'BTC');
                    }

                  }
              });
          });
        });
      });

}



//****************//
// Collection of Functions
//requirejs('./requirements/collection.js');
//****************//
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

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
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