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
var lastdata = new Array();
function chartPoint(data, symbol) {
  symbol = symbolswitch(symbol);
  // Check if the value has changed and put it in the DB
  if (data && Number(data) && data != lastdata[symbol] || time-lastdata[time] > 1000) {
    var price = {
      symbol: symbol,
      price: data,
      time: time
    };
    var historicprice = new Historicprices(price);
    historicprice.save();
    lastdata[symbol] = data;
    lastdata[time] = time;
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

  updateAddresses();

}, keys.site.updatems);
