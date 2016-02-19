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
    Activetrades.find({ user: myName }).sort({time:-1}).find(function(err, activetrades) {
      socket.emit('activetrades', activetrades);
      trades = activetrades;
    });
    socket.emit('loadpage', {page: data.page, symbol: data.symbol, guest: data.guest});
    socket.emit(data.symbol+'_price', price[data.symbol]);
    //socket.emit('nexttrade', { next: nexttrade, stoptrading: keys.site.stoptrading });
  });

  socket.on('chart', function (data) {
    if (!data.candle || data.candle < 1000) data.candle = 60000;
    if (!data.time) data.time = 1800000;
    if (!data.type) data.type = 'line';
    var points = new Array(); var lastdoc;
    if (data.type == 'line') {
      Historicprices.find({ symbol: data.symbol }).where('time').gte(time-data.time).sort({ time: -1 }).exec(function (err, docs) {
      if (err) throw (err);
      
        async.each(docs, function (data) {

          points.unshift([Number(data.time), Number(data.price)]);

        });      
        socket.emit('chart', { symbol: data.symbol, chart: points, type: data.type });
      });
    } else if (data.type == 'candlestick') {
       
        Historicprices.find({ symbol: data.symbol }).where('time').gte(time-data.time).sort({ time: -1 }).exec(function (err, docs) {
        if (docs) {
          
          for (var t = 0; t < data.time; t = t + data.candle ) {
            
            var open; var high; var low; var close;
            
            for (var i = docs.length - 1; i >= 0; i--) {
            
              if ( docs[i].time > time-data.time+t && docs[i].time < time-data.time+t+data.candle ) {

                if ( !open ) open = Number(docs[i].price);
                if ( !high || high < Number(docs[i].price) ) high = Number(docs[i].price);
                if ( !low || low > Number(docs[i].price) ) low = Number(docs[i].price);
                close = Number(docs[i].price);

              }
            
            }
            
            points.push([Number(time-data.time+t), Number(open), Number(high), Number(low), Number(close)]);
          
          }
          
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
        userlevel = docs.level;
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
            level: userlevel,
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

  Historictrades.find({ user: myName }).sort({time:-1}).limit(25).find(function(err, historictrades) {
    socket.emit('historictrades', historictrades);
  });
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

          Activetrades.find({ }, function(err, data) {
            if (err) throw (err);
            socket.emit('allactivetrades', data);
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
  Activetrades.find({ user: myName }).sort({time:-1}).find(function(err, activetrades) {
    socket.emit('activetrades', activetrades);
  });

  // Pass new trade details from the socket to addTrade
  socket.on('trade', function (data) {
    if (data.user == myName) {
      // Check if input data is valid
      var re = new RegExp(/[\s\[\]\(\)=,"\/\?@\:\;]/g);
      if (re.test(data.amount)) { console.log('Illegal trade input from '+myName); } else {
        // Push data to addTrade
        //console.log('add trade for ' + data.user);
        addTrade(data.symbol, data.amount, data.direction, data.user, data.time, socket);
        // Emit active trades again
        Activetrades.find({ user: myName }).sort({time:-1}).find(function(err, activetrades) {
          socket.emit('activetrades', activetrades);
        });
      }
    }
  });



  socket.on('historictrades', function (data) {
    if ( myName != keys.site.admin ) data.user = myName;
    if (!data.limit ) data.limit = 25;
    if (!data.skip ) data.skip = 0;
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

    listtx(myName, function (err, data) {
      if (err) throw (err);
      socket.emit('wallettx', data);
    });
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