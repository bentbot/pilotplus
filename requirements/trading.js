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
var useraddress = {};
var y = new Array();
var x = new Array();
var z = new Array();
var a = 0;


// Master trade function
//=trade
function trade() {
     // Money managing object
     var change = new ObjectManage();

     // Looped trades and incrementer
     var loopedtrades = new Array(), t = 0;

    // Main loop
    trades.forEach( function (trade) {
      t++; // Increment loop

      // Get the correct time cycle for this trade
      var cycle;
      for (var i = nexttrade.length - 1; i >= 0; i--) {
        if ( nexttrade[i].time == trade.expires ) {
          cycle = nexttrade[i];
        }
      };

      // Check if the cycle has ended
      if (cycle.seconds < keys.site.stoptrading) {
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
          if ( change.$exists(trade.user+'.'+trade.currency) ){
            // Get user's amount
            var userbalance = change.$get(trade.user+'.'+trade.currency);
            var balance = Number( userbalance ).toFixed(2);
            var userwinnings = Number( winnings ).toFixed(2);
            var userwinnings = Number( +balance+userwinnings ).toFixed(2);
            // Recalculate and set amount
            change.$set(trade.user+'.'+trade.currency, userwinnings);

          } else {
            change.$set(trade.user+'.'+trade.currency, winnings);
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
          if (err) console.log(err);
        });

      }// timing cycle check
    });//foreach trade loop

    // Save money
    if ( loopedtrades.length > 0 ) console.log(change)


    cookTrades(loopedtrades);

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
}
// Post trading notifications
function cookTrades(trades) {
  if (trades.length > 0) console.log('Traded '+date.toString());

  var xp = new Array();
  var currentlevel = new Array();
  var lastlevel = new Array();
  var nextlevel = new Array();

  async.each(trades, function (trade) {

    User.findOne({ username: trade.user }, function (err, user) {
      if (err) throw (err);
            Historictrades.find({ user: trade.user }, function (err, historic) {
        if (err) throw (err);
    
        var achievements = {}, experience, percentage = 50, i, w, l;

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

        if (user.experience) {
          experience = Number(+Number(user.experience) + +Number(xp[trade.user]));
        } else {
          experience = Number(xp[trade.user]);
        }

          percentage = w/l*100; 
          achievements.percentage = Number(percentage);
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

          User.findOneAndUpdate({ username: trade.user }, achievements, {upsert: true}, function (err) {
            if (err) throw (err);
          });
          console.log('Trade outcome for ' + trade.user + ' Won:' + x[trade.user] + ' Tied:' + y[trade.user] + ' Lost:' + z[trade.user]);
          io.sockets.emit('tradeoutcome',  { user: trade.user, x: x[trade.user], y: y[trade.user], z: z[trade.user], xp: xp[trade.user], level: currentlevel[trade.user], lastlevel: lastlevel[trade.user], nextlevel: nextlevel[trade.user] } );
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
                socket.emit('activetrades', trades);
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
var nexttrade = new Array(), nexttradesecs = new Array(),nexttrademins = new Array(),nexttradehrs = new Array(), hrs = new Array(),  mins = new Array(), secs = new Array();

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

     if (nexttradesecs[i] == 0) trade();

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
Activetrades.find({ },function(err, data) {
  if (err) throw (err)
    trades = data;
    io.sockets.emit('activetrades', data);
});