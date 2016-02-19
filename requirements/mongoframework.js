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
var schema = new mongoose.Schema({ username: 'string', createdAt: { type: Date, expires: '1h' }});
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
