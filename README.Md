# Bitcoin Binary Options

## Setup

### 1. Install Node.js, Redis, and MongoDB
```

Install [Node.js](https://nodejs.org/en/download/) with *npm*

Use a batch script or apt-get to install MongoDB and Redis

$ sudo chmod +x ./dependencies.sh
$ sudo bash ./dependencies.sh

*Note that this script might install older versions*

```
Setup Mongodb with a local admin and so that NodeJS can connect. 
```
$ mongo
use admin
db.createUser({user:"supermongo", pwd:"7zof44Xncx2J1p8", roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]});
db.auth({user:"supermongo", pwd:"7zof44Xncx2J1p8"});
use binarybtc
db.addUser("nodemongo", "WYd224Oa612h147")
```

### 2. Create the necessary key file `keys.json`
Edit the default keys.json file and edit the following options.
```
$ nano keys.json

{
	"authy": "AuthyDeveloperOrProductionAPIKey",
	"coin": "AnExtraLongPasswordForBackendBitcoinAPIAccess",
	"cookie": "ACustomCookieHash6132629810",
	"mongo": "mongodb://nodemongo:WYd224Oa612h147@localhost/binarybtc",
	"redis": "MasterRedisPasswordConfigSomethingLong",
	"send": "MasterAdminKeyToSendMoney",
    "btcrpc": {
        "user": "bitcoin",
        "password": "ThatBitcoinRemoteAccessKey"
	},
	"stripe": { 
		"secret": "sk_test_Stripe.com_PaymentAPI",
		"publishable": "pk_test_Stripe.com_PaymentAPI" 
	},
	"ssl": {
		"ca": "/home/ubuntu/keys/domain.ca.pem",
		"cert": "/home/ubuntu/keys/domain.crt.pem",
		"key": "/home/ubuntu/keys/server.key"
	}
}

```
An index of options included in `keys.json`:

	* Symbol and currency selection
	* Default symbol
	* API Settings
	* Security settings
	* IRC Channel
	* Site name and domain 
	* Admin username
	* Offer percentages
	* Demo money
	* Trade timing
	* Allow or disallow signups or trading
	* Maximum trade amount
	* Ratio based trade shaping
	* Experience and levels
	* Funding options
	* Mail Settings
	* SSL Settings

### 3. Install NodeJS both locally and remotely to start the servers

If you already have Node and NPM installed, start the server with `node binarybtc.js`

If you need to install Node.Js, run these commands.
```
$ sudo apt-get install npm
$ wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.24.1/install.sh | bash
$ nvm install 0.10.25
$ npm install -g forever
$ npm install -g nodemon

$ npm install
$ npm update
     
$ nodemon binarybtc.js

```
