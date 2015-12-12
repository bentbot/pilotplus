# Bitcoin Binary Options

## Setup

### 1. Install Redis and MongoDB for user management
```
Create a batch script to install MongoDB

$ sudo chmod +x ./dependencies.sh
$ sudo bash ./dependencies.sh

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

### 2. Create the necessary keyfile `keys.json` and specify application keys
```
$ nano keys.json

{
	"authy": "https://authy.com/developers",
	"coin": "kapitalcoin private key",
	"irc": "irc://localhost:6667/channel",
	"mongo": "mongodb://nodemongo:WYd224Oa612h147@localhost/binarybtc",
	"redis": "redismasterpass",
	"send": "mastersend",
	"ssl": {
		"ca": "/home/ubuntu/keys/server.ca",
		"key": "/home/ubuntu/keys/server.key",
		"cert": "/home/ubuntu/keys/webserver.crt"
	}
}


```


### 3. Install NodeJS both locally and remotely to start the servers
```
$ sudo apt-get install npm
$ wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.24.1/install.sh | bash
$ nvm install 0.10.25
$ npm install -g forever
$ npm install -g nodemon

$ npm install
$ npm update
     
$ nodemon binarybtc.js

$ apt-add-repository ppa:bitcoin/bitcoin
$ apt-get update
$ apt-get install bitcoind
$ bitcoind
    
$ forever kapitalcoin.js
```
