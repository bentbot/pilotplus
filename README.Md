# [Pilot.Plus](https://pilot.plus/) Binary Options

## Setup

### 1. Install Node.js, Redis, and MongoDB
Install [Node.js](https://nodejs.org/en/download/) with *npm* if not already installed. This tutorial works best in  Ubuntu virtual environments.

````
$ yum install gcc
$ yum install gcc-c++
````

Use a batch script or `apt-get` to install **MongoDB** and **Redis**
```
$ sudo chmod +x ./dependencies.sh
$ sudo bash ./dependencies.sh
```
*Note that this script might install older versions of MongoDB and Redis.*

Now setup Mongodb with a local admin and so that Node.JS can connect. 
```
$ mongo
use admin
db.createUser({user:"supermongo", pwd:"SuperSecureKey", roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]});
db.auth({user:"supermongo", pwd:"SuperSecureKey"});
use binarybtc
db.addUser("nodemongo", "MongoPassword")
```

### 2. Create the necessary key file `keys.json`

Edit the default keys.json file and edit the following options as they are required for proper operation.

```
$ nano keys.json

{
	"authy": "AuthyDeveloperOrProductionAPIKey",
	"coin": "AnExtraLongPasswordForBackendBitcoinAPIAccess",
	"cookie": "ACustomCookieHash6132629810",
	"mongo": "mongodb://nodemongo:MongoPassword@localhost/binarybtc",
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
* An index of options included in `keys.json`
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

	Please remove the SSL block if you are not using a domain with SSL

### 3. Install NodeJS both locally and remotely to start the servers

If you already have Node and NPM installed, start the server with `node binarybtc.js` or `nodemon`

If you need to install Node.Js, run these commands.
```
$ sudo apt-get install npm
$ wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.24.1/install.sh | bash
$ nvm install 0.10.25
$ npm install -g forever
$ npm install -g nodemon

$ sudo npm install
$ sudo npm update
     
$ nodemon binarybtc.js

```
##### Connect to the webserver at http://localhost:8080/

### Troubleshooting

Diagnosing any errors the console may output is important. 
##### Common Errors

###### Missing, undefined, or unknown *Node_Modules* plugins
* Run the NPM installer again `sudo npm install` or `sudo npm update`
* Try installing missing Node modules manually by finding the name in the error:
    *  *...Missing required module* **'object-manage'**
    *  Run `sudo npm install object-manage`

###### Could not connect to MongoDB 
* Use `mongo` in the console to check if MongoDB is correctly installed.
* Refer to section 1 to create a MongoDB collection with a user and password
* Add the correct username and password as a MongoDB link inside `keys.json`
	* `mongo:	"mongodb://[user]:[pass]@localhost/[collection]",`

###### Redis connection errors
* Make sure `redis-server` is installed and running by using `top` in the console.
* Check your Redis config file `sudo nano /etc/redis/redis.conf` for an authentication password
* Open keys.json and edit the Redis password line
    * `"redis": "RedisMasterPassword",`
