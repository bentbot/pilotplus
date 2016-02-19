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

app.get('/sub/:subdomain', function( req, res ) {
  res.send(req.params.subdomain);
});

app.get('/check/:username/:password', function( req, res ) {
	var result = userFetch(req.params.username, req.params.password)
	res.send(result);
});

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