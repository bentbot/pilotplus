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