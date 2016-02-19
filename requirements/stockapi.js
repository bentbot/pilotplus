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
        var req = https.get(btceoptions, function(resp){
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
            updatePrice(data, symbol);
            price[symbol] = data;
            }else {
              lag = lag+2;
            }
          });
        }).on("error", function(e){
          //console.log("Got "+btceoptions.host+" error: " + e.message);
          lag = lag+2;
        }); // if symbol is a currency, we run it through for the exchange rate
      } else if (symbol == 'LTCUSD') {
        var symb = symbol.match(/.{3}/g);
        var symb = symbol.toLowerCase();
        symb = symb[0];
        btceoptions.path = '/api/2/ltc_usd/ticker';
        var req = https.get(btceoptions, function(resp){
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