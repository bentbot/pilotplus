
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
  if (keys.site.robots == 'disallow') {
    robot = 'User-agent: *\t\n\rDisallow: /';
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
          Userfirewall.count({username: username}, function(err, c){
            if (err) throw (err)
            // If this user has less than 5 failed login attempts in the past hour
            if (c < 10) {
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
                                createdAt: date
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