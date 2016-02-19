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
              if (callback) callback(errors);
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
